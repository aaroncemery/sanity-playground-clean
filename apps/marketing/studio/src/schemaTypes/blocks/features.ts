import {defineType, defineField, defineArrayMember} from 'sanity'
import {Grid3x3} from 'lucide-react'

export const features = defineType({
  name: 'features',
  title: 'Features Section',
  icon: Grid3x3,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Section Title',
      description: 'Optional title for the features section',
      validation: (rule) =>
        rule.max(100).warning('Title should be under 100 characters'),
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      description: 'Optional description for the features section',
      rows: 2,
      validation: (rule) =>
        rule.max(200).warning('Description should be under 200 characters'),
    }),
    defineField({
      name: 'layout',
      type: 'string',
      title: 'Layout',
      description: 'Number of columns for features grid',
      options: {
        list: [
          {title: '2 Columns', value: '2-column'},
          {title: '3 Columns', value: '3-column'},
        ],
        layout: 'radio',
      },
      initialValue: '3-column',
    }),
    defineField({
      name: 'features',
      type: 'array',
      title: 'Features',
      description: 'Add individual features to display',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'icon',
              type: 'string',
              title: 'Icon',
              description: 'Icon name or emoji (e.g., "🚀" or "rocket")',
            }),
            defineField({
              name: 'title',
              type: 'string',
              title: 'Feature Title',
              validation: (rule) => [
                rule.required().error('Feature title is required'),
                rule.max(60).warning('Feature title should be under 60 characters'),
              ],
            }),
            defineField({
              name: 'description',
              type: 'text',
              title: 'Feature Description',
              rows: 3,
              validation: (rule) => [
                rule.required().error('Feature description is required'),
                rule.max(200).warning('Feature description should be under 200 characters'),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
              icon: 'icon',
            },
            prepare({title, icon}) {
              return {
                title: title || 'Feature',
                subtitle: icon || 'No icon',
              }
            },
          },
        }),
      ],
      validation: (rule) => [
        rule.required().error('At least one feature is required'),
        rule.min(2).warning('Consider adding at least 2 features'),
        rule.max(12).warning('Consider limiting to 12 features for better readability'),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      layout: 'layout',
      features: 'features',
    },
    prepare({title, layout, features}) {
      const count = features?.length || 0
      return {
        title: title || 'Features Section',
        subtitle: `${count} features • ${layout || '3-column'}`,
        media: Grid3x3,
      }
    },
  },
})
