import {defineType, defineField, defineArrayMember} from 'sanity'
import {ClipboardList} from 'lucide-react'

export const pimSyncLog = defineType({
  name: 'pimSyncLog',
  type: 'document',
  title: 'PIM Sync Log',
  icon: ClipboardList,
  description: 'Audit trail of PIM synchronization events',
  fields: [
    defineField({
      name: 'syncedAt',
      type: 'datetime',
      title: 'Sync Time',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'syncSource',
      type: 'string',
      title: 'Source System',
    }),
    defineField({
      name: 'recordsProcessed',
      type: 'number',
      title: 'Records Processed',
    }),
    defineField({
      name: 'recordsSucceeded',
      type: 'number',
      title: 'Records Succeeded',
    }),
    defineField({
      name: 'recordsFailed',
      type: 'number',
      title: 'Records Failed',
    }),
    defineField({
      name: 'errors',
      type: 'array',
      title: 'Errors',
      of: [defineArrayMember({type: 'text', rows: 2})],
    }),
  ],
  preview: {
    select: {
      title: 'syncedAt',
      source: 'syncSource',
      processed: 'recordsProcessed',
      failed: 'recordsFailed',
    },
    prepare({title, source, processed, failed}: {title?: string; source?: string; processed?: number; failed?: number}) {
      const failedBadge = failed && failed > 0 ? ` • ❌ ${failed} failed` : ' • ✅ OK'
      return {
        title: title ? new Date(title).toLocaleString() : 'Unknown time',
        subtitle: `${source || 'unknown'} • ${processed || 0} records${failedBadge}`,
      }
    },
  },
})
