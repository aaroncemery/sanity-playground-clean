import {defineType, defineField, defineArrayMember} from 'sanity'
import {LayoutGridIcon} from 'lucide-react'

export const leftRightContent = defineType({
  name: 'leftRightContent',
  title: 'Left Right Content',
  icon: LayoutGridIcon,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'The title of the left right content block',
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      description: 'The description of the left right content block',
    }),
    defineField({
      name: 'leftContent',
      type: 'array',
      title: 'Left Content',
      description: 'The content of the left side of the left right content block',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'rightContent',
      type: 'array',
      title: 'Right Content',
      description: 'The content of the right side of the left right content block',
      of: [defineArrayMember({type: 'block'})],
    }),
  ],
})
