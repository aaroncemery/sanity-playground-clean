import {defineType, defineField, defineArrayMember} from 'sanity'
import {BarChart} from 'lucide-react'

export const statsSection = defineType({
  name: 'statsSection',
  title: 'Stats Section',
  icon: BarChart,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Section Title',
      description: 'Optional title for the stats section',
      validation: (rule) =>
        rule.max(100).warning('Title should be under 100 characters'),
    }),
    defineField({
      name: 'layout',
      type: 'string',
      title: 'Layout',
      description: 'Number of columns for stats grid',
      options: {
        list: [
          {title: '2 Columns', value: '2-column'},
          {title: '3 Columns', value: '3-column'},
          {title: '4 Columns', value: '4-column'},
        ],
        layout: 'radio',
      },
      initialValue: '3-column',
    }),
    defineField({
      name: 'stats',
      type: 'array',
      title: 'Stats',
      description: 'Add statistics to display',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'value',
              type: 'string',
              title: 'Stat Value',
              description: 'The number or percentage (e.g., "99%", "10M+", "$5B")',
              validation: (rule) => [
                rule.required().error('Stat value is required'),
                rule.max(20).warning('Stat value should be under 20 characters'),
              ],
            }),
            defineField({
              name: 'label',
              type: 'string',
              title: 'Label',
              description: 'Label for the stat (e.g., "Uptime", "Active Users")',
              validation: (rule) => [
                rule.required().error('Label is required'),
                rule.max(50).warning('Label should be under 50 characters'),
              ],
            }),
            defineField({
              name: 'description',
              type: 'text',
              title: 'Description',
              description: 'Optional additional context',
              rows: 2,
              validation: (rule) =>
                rule.max(150).warning('Description should be under 150 characters'),
            }),
          ],
          preview: {
            select: {
              value: 'value',
              label: 'label',
            },
            prepare({value, label}) {
              return {
                title: `${value || '?'} ${label || 'Stat'}`,
              }
            },
          },
        }),
      ],
      validation: (rule) => [
        rule.required().error('At least one stat is required'),
        rule.min(2).warning('Consider adding at least 2 stats'),
        rule.max(8).warning('Consider limiting to 8 stats for better readability'),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      layout: 'layout',
      stats: 'stats',
    },
    prepare({title, layout, stats}) {
      const count = stats?.length || 0
      return {
        title: title || 'Stats Section',
        subtitle: `${count} stats • ${layout || '3-column'}`,
        media: BarChart,
      }
    },
  },
})
