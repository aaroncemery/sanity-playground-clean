import {defineType, defineField} from 'sanity'
import {VenetianMaskIcon} from 'lucide-react'

export const hero = defineType({
  name: 'hero',
  title: 'Hero',
  icon: VenetianMaskIcon,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'The title of the hero block',
    }),
  ],
})
