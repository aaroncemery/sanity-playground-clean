import {documentEventHandler} from '@sanity/functions'

/**
 * Validates offerRule documents on create/update.
 *
 * Why this matters for the JitB POC:
 * - Marketers control rules, but bad config (overlapping tiers, missing tokens,
 *   margin floor too low) can cause real revenue loss.
 * - This Function runs on every write, so Studio + API + Vision can't bypass it.
 *
 * Failures throw — Sanity rolls back the write and surfaces the error in Studio.
 */

interface Tier {
  label?: string
  lowerBound?: number
  target?: number
  rewardType?: string
  rewardValue?: number
}

interface CopyVariant {
  variantId?: string
  headline?: string
  body?: string
  cta?: string
}

interface OfferRuleDocument {
  _id: string
  _type: string
  name?: string
  enabled?: boolean
  marginFloor?: number
  tiers?: Tier[]
  copyVariants?: CopyVariant[]
}

const MARGIN_FLOOR_MIN = 15
const KNOWN_TOKENS = ['[GAP]', '[REWARD]', '[TARGET]']

export const handler = documentEventHandler(async ({event}) => {
  const operation = event.type
  if (!['document.create', 'document.update'].includes(operation)) return

  const document = (event.data?.data || event.data) as OfferRuleDocument | undefined
  if (!document || document._type !== 'offerRule') return

  const errors: string[] = []
  const warnings: string[] = []

  // 1. At least one tier
  const tiers = document.tiers ?? []
  if (tiers.length === 0) {
    errors.push('At least one tier is required.')
  }

  // 2. Margin floor safety
  if (
    typeof document.marginFloor === 'number' &&
    document.marginFloor < MARGIN_FLOOR_MIN
  ) {
    errors.push(
      `marginFloor (${document.marginFloor}%) is below the safety threshold of ${MARGIN_FLOOR_MIN}%.`,
    )
  }

  // 3. Tier sanity + non-overlap
  const sortedTiers = [...tiers]
    .filter(
      (t) => typeof t.lowerBound === 'number' && typeof t.target === 'number',
    )
    .sort((a, b) => (a.lowerBound ?? 0) - (b.lowerBound ?? 0))

  sortedTiers.forEach((tier, i) => {
    const label = tier.label || `Tier ${i + 1}`
    const lower = tier.lowerBound!
    const target = tier.target!
    if (target <= lower) {
      errors.push(`${label}: target ($${target}) must be > lowerBound ($${lower}).`)
    }
    const next = sortedTiers[i + 1]
    if (next && typeof next.lowerBound === 'number' && next.lowerBound < target) {
      errors.push(
        `${label} overlaps with the next tier (target $${target} > next lowerBound $${next.lowerBound}).`,
      )
    }
    if (tier.rewardType === 'freeItem' && typeof tier.rewardValue !== 'number') {
      // Allowed — rewardItem holds the data; rewardValue is irrelevant for freeItem.
    } else if (
      ['percentOff', 'dollarOff', 'bonusPoints'].includes(tier.rewardType ?? '') &&
      typeof tier.rewardValue !== 'number'
    ) {
      errors.push(`${label}: rewardValue is required for rewardType "${tier.rewardType}".`)
    }
    if (tier.rewardType === 'percentOff' && (tier.rewardValue ?? 0) > 100) {
      errors.push(`${label}: percentOff rewardValue cannot exceed 100.`)
    }
  })

  // 4. Copy variants — at least one, with all tokens recognized
  const variants = document.copyVariants ?? []
  if (variants.length === 0) {
    errors.push('At least one copy variant is required.')
  }
  variants.forEach((v) => {
    const id = v.variantId || '?'
    if (!v.headline) {
      errors.push(`Copy variant ${id}: headline is required.`)
    }
    const fields = [v.headline, v.body, v.cta].filter(Boolean) as string[]
    fields.forEach((text) => {
      const matches = text.match(/\[[A-Z_]+\]/g) ?? []
      matches.forEach((token) => {
        if (!KNOWN_TOKENS.includes(token)) {
          warnings.push(
            `Copy variant ${id}: unknown token ${token} (known: ${KNOWN_TOKENS.join(', ')}).`,
          )
        }
      })
    })
  })

  if (warnings.length > 0) {
    console.warn('[OFFER RULE VALIDATION] warnings', {
      documentId: document._id,
      name: document.name,
      warnings,
    })
  }

  if (errors.length > 0) {
    console.error('[OFFER RULE VALIDATION] REJECTED', {
      documentId: document._id,
      name: document.name,
      errors,
    })
    throw new Error(
      [
        '🚫 OFFER RULE VALIDATION FAILED',
        '',
        ...errors,
        ...(warnings.length ? ['', 'Warnings (non-blocking):', ...warnings] : []),
        '',
        '---',
        'Fix these issues in Studio and try again. The same rules run for API writes.',
      ].join('\n'),
    )
  }

  console.log('✅ Offer rule validation PASSED', {
    name: document.name,
    tiers: tiers.length,
    variants: variants.length,
    warnings: warnings.length,
  })
})
