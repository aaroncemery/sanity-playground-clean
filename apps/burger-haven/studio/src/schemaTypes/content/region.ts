import {defineType, defineField, defineArrayMember} from 'sanity'
import {Globe} from 'lucide-react'

export const region = defineType({
  name: 'region',
  type: 'document',
  title: 'Region',
  icon: Globe,
  description: 'Geographic regions for targeting',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Region Name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'code',
      type: 'string',
      title: 'Region Code',
      description: 'Short code (e.g., CA, GA, TX)',
    }),
    defineField({
      name: 'states',
      type: 'array',
      title: 'States',
      of: [defineArrayMember({type: 'string'})],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      code: 'code',
    },
    prepare({title, code}: {title?: string; code?: string}) {
      return {
        title: title || 'Unknown Region',
        subtitle: code || '',
      }
    },
  },
})
