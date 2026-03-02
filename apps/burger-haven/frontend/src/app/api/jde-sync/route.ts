import {NextRequest, NextResponse} from 'next/server'
import {jdeDemoClient, jdeDemoWriteClient} from '@/lib/sanity'

/**
 * POST /api/jde-sync
 *
 * Simulates a JDE ERP → Sanity sync cycle demonstrating:
 * 1. Deterministic document IDs (product-${jdeId}) for idempotent createOrReplace
 * 2. Diff-before-write: reads current doc and skips mutation if unchanged
 * 3. Transaction batching: all mutations committed in one API call
 * 4. CDN reads vs. non-CDN writes: reads use useCdn:false but counted separately
 *
 * Writes to the `jdedemo` dataset — a sandbox safe to wipe and reset.
 *
 * action=seed  → write all records unconditionally (first-run / seeding)
 * action=sync  → diff-check or naive sync cycle (subsequent run)
 * action=reset → delete all product-JDE-* documents
 */

export interface JdeRecord {
  jdeId: string
  sku: string
  name: string
  category: 'burgers' | 'chicken' | 'breakfast' | 'sides' | 'drinks'
  basePrice: number
  allergens: string[]
  nutritionFacts: {
    calories: number
    protein: number
    carbs: number
    fat: number
    sodium: number
  }
}

export interface SyncRequestBody {
  action: 'seed' | 'sync' | 'reset'
  records?: JdeRecord[]
  /** If true, skip diff check and write every record unconditionally */
  naive?: boolean
  /** If true, build the transaction but do not commit — real reads, real diff, no writes */
  dryRun?: boolean
}

export interface SyncResult {
  action: 'seed' | 'sync' | 'reset'
  totalRecords: number
  skipped: number
  mutated: number
  deleted?: number
  /** Number of Sanity read API calls */
  readApiCalls: number
  /** Number of write transactions */
  writeTransactions: number
  totalApiCalls: number
  elapsedMs: number
  mode: 'diff-check' | 'naive' | 'seed' | 'reset'
  dryRun: boolean
}

/** Fields we diff against — realistic for an ERP sync (not image, not metadata) */
function diffRecord(incoming: JdeRecord, stored: Record<string, unknown> | null): boolean {
  if (!stored) return true // new document
  return (
    stored.name !== incoming.name ||
    stored.basePrice !== incoming.basePrice ||
    stored.category !== incoming.category ||
    JSON.stringify((stored.allergens as string[] | undefined)?.slice().sort()) !==
      JSON.stringify(incoming.allergens.slice().sort())
  )
}

function jdeRecordToSanityDoc(record: JdeRecord) {
  return {
    _type: 'product' as const,
    _id: `product-${record.jdeId}`,
    sku: record.sku,
    pimProductId: record.jdeId,
    name: record.name,
    category: record.category,
    basePrice: record.basePrice,
    allergens: record.allergens,
    nutritionFacts: record.nutritionFacts,
    pimMetadata: {
      syncSource: 'demo' as const,
      syncStatus: 'synced' as const,
      lastSyncedAt: new Date().toISOString(),
    },
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = (await request.json()) as SyncRequestBody
    const {action, records = [], naive = false, dryRun = false} = body

    // -----------------------------------------------------------------------
    // RESET: delete all seeded documents
    // -----------------------------------------------------------------------
    if (action === 'reset') {
      const existing = await jdeDemoClient.fetch<Array<{_id: string}>>(
        `*[_type == "product" && string::startsWith(_id, "product-JDE-")]{_id}`,
      )
      const readApiCalls = 1
      const deleted = existing.length

      const CHUNK = 50
      let deleteTransactions = 0
      if (deleted > 0 && !dryRun) {
        for (let i = 0; i < existing.length; i += CHUNK) {
          const chunk = existing.slice(i, i + CHUNK)
          const tx = jdeDemoWriteClient.transaction()
          for (const doc of chunk) tx.delete(doc._id)
          await tx.commit()
          deleteTransactions++
        }
      }

      return NextResponse.json({
        action: 'reset',
        totalRecords: deleted,
        skipped: 0,
        mutated: 0,
        deleted,
        readApiCalls,
        writeTransactions: deleteTransactions,
        totalApiCalls: readApiCalls + deleteTransactions,
        elapsedMs: Date.now() - startTime,
        mode: 'reset',
        dryRun,
      } satisfies SyncResult)
    }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({error: 'records array is required'}, {status: 400})
    }

    // -----------------------------------------------------------------------
    // SEED: write all records unconditionally, no reads
    // Chunked into batches of 50 to stay within serverless timeout limits.
    // -----------------------------------------------------------------------
    if (action === 'seed') {
      const CHUNK = 50
      let writeTransactions = 0
      for (let i = 0; i < records.length; i += CHUNK) {
        const chunk = records.slice(i, i + CHUNK)
        const tx = jdeDemoWriteClient.transaction()
        for (const record of chunk) tx.createOrReplace(jdeRecordToSanityDoc(record))
        if (!dryRun) await tx.commit()
        writeTransactions++
      }

      return NextResponse.json({
        action: 'seed',
        totalRecords: records.length,
        skipped: 0,
        mutated: records.length,
        readApiCalls: 0,
        writeTransactions,
        totalApiCalls: writeTransactions,
        elapsedMs: Date.now() - startTime,
        mode: 'seed',
        dryRun,
      } satisfies SyncResult)
    }

    // -----------------------------------------------------------------------
    // SYNC: diff-check or naive subsequent sync cycle
    // -----------------------------------------------------------------------
    let skipped = 0
    let mutated = 0
    let readApiCalls = 0

    const tx = jdeDemoWriteClient.transaction()

    if (naive) {
      for (const record of records) {
        tx.createOrReplace(jdeRecordToSanityDoc(record))
        mutated++
      }
    } else {
      // Batch fetch all current docs in one GROQ query — 1 read API call
      const ids = records.map((r) => `product-${r.jdeId}`)
      const stored = await jdeDemoClient.fetch<Array<Record<string, unknown> | null>>(
        `*[_id in $ids]{_id, name, basePrice, category, allergens}`,
        {ids},
      )
      readApiCalls = 1

      const storedMap = new Map(stored.filter(Boolean).map((d) => [d!._id as string, d!]))

      for (const record of records) {
        const docId = `product-${record.jdeId}`
        const currentDoc = storedMap.get(docId) ?? null
        if (!diffRecord(record, currentDoc)) {
          skipped++
          continue
        }
        tx.createOrReplace(jdeRecordToSanityDoc(record))
        mutated++
      }
    }

    const writeTransactions = mutated > 0 ? 1 : 0
    if (mutated > 0 && !dryRun) await tx.commit()

    return NextResponse.json({
      action: 'sync',
      totalRecords: records.length,
      skipped,
      mutated,
      readApiCalls,
      writeTransactions,
      totalApiCalls: readApiCalls + writeTransactions,
      elapsedMs: Date.now() - startTime,
      mode: naive ? 'naive' : 'diff-check',
      dryRun,
    } satisfies SyncResult)
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error')
    return NextResponse.json({error: error.message}, {status: 500})
  }
}
