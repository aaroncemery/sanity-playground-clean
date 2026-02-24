import {documentEventHandler} from '@sanity/functions'

/**
 * Creates audit trail of all PIM sync activity.
 * Tracks successful writes for monitoring and debugging.
 *
 * In production, this could:
 * - Write to a pimSyncLog document for dashboard visibility
 * - Send to external monitoring (DataDog, New Relic, etc.)
 * - Trigger Slack notifications for failed syncs
 * - Update analytics/metrics
 */

interface SyncableDocument {
  _id: string
  _type: string
  sku?: string
  pimMetadata?: {
    syncSource?: string
    syncStatus?: string
  }
}

export const handler = documentEventHandler(async ({event}) => {
  const document = event.data?.data || event.data
  const operation = event.type

  if (!document || !document._type) {
    return
  }

  const syncableTypes = ['product', 'productPricing', 'storeLocation']
  if (!syncableTypes.includes(document._type)) {
    return
  }

  if (!['document.create', 'document.update'].includes(operation)) {
    return
  }

  const doc = document as SyncableDocument

  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    documentType: doc._type,
    documentId: doc._id,
    sku: doc.sku,
    syncSource: doc.pimMetadata?.syncSource || 'unknown',
    syncStatus: doc.pimMetadata?.syncStatus || 'unknown',
  }

  console.log('[SYNC AUDIT]', JSON.stringify(logEntry, null, 2))
})
