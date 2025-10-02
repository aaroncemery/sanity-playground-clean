import {defineField, defineType} from 'sanity'
import {ExternalLinkIcon, LinkIcon, MergeIcon} from 'lucide-react'

export const redirect = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  icon: MergeIcon,
  fields: [
    defineField({name: 'from', type: 'string'}),
    defineField({name: 'to', type: 'string'}),
    defineField({name: 'type', type: 'string', options: {list: ['internal', 'external']}}),
  ],
  preview: {
    select: {
      from: 'from',
      to: 'to',
      type: 'type',
    },
    prepare: ({from, to, type}) => ({
      title: `${from} -> ${to}`,
      subtitle: type === 'internal' ? 'Internal' : 'External',
      media: type === 'internal' ? LinkIcon : ExternalLinkIcon,
    }),
  },
})
