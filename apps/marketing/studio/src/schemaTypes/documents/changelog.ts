import {ClipboardListIcon} from 'lucide-react'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {GROUP, GROUPS} from '../../utils/constant'
import {isUnique} from '../../utils/slug'

export const changelog = defineType({
  name: 'changelog',
  title: 'Platform Updates',
  icon: ClipboardListIcon,
  type: 'document',
  groups: GROUPS,
  description: 'Monthly platform update notes showcasing new features and improvements.',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => rule.required().error('A title is required'),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL',
      description: 'Auto-generated from the title. Prefixed with updates/',
      group: GROUP.MAIN_CONTENT,
      options: {
        source: 'title',
        slugify: (input) => `updates/${input.toLowerCase().replace(/\s+/g, '-')}`,
        isUnique,
      },
      validation: (rule) => rule.required().error('A URL slug is required'),
    }),
    defineField({
      name: 'releaseMonth',
      type: 'datetime',
      title: 'Release Month',
      description: 'Month this changelog entry covers — used for ordering and display',
      group: GROUP.MAIN_CONTENT,
      options: {
        dateFormat: 'MMMM YYYY',
      },
      validation: (rule) => rule.required().error('A release month is required'),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      title: 'Summary',
      rows: 3,
      description: '2–3 sentence hero blurb for this release',
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => rule.required().error('A summary is required'),
    }),
    defineField({
      name: 'features',
      type: 'array',
      title: 'Features',
      group: GROUP.MAIN_CONTENT,
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          title: 'Feature',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Title',
              validation: (rule) => rule.required().error('Feature title is required'),
            }),
            defineField({
              name: 'description',
              type: 'richText',
              title: 'Description',
            }),
            defineField({
              name: 'badge',
              type: 'string',
              title: 'Badge',
              options: {
                list: [
                  {title: 'New', value: 'new'},
                  {title: 'Improved', value: 'improved'},
                  {title: 'Studio', value: 'studio'},
                  {title: 'API', value: 'api'},
                  {title: 'Developer', value: 'developer'},
                ],
                layout: 'radio',
              },
            }),
            defineField({
              name: 'docsUrl',
              type: 'url',
              title: 'Docs URL',
              description: 'Optional link to documentation',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              badge: 'badge',
            },
            prepare({title, badge}: {title?: string; badge?: string}) {
              const badgeEmoji: Record<string, string> = {
                new: '🟢',
                improved: '🟡',
                studio: '🔵',
                api: '🟣',
                developer: '🟠',
              }
              return {
                title: title || 'Untitled Feature',
                subtitle: badge ? `${badgeEmoji[badge] || ''} ${badge}` : 'No badge',
                media: ClipboardListIcon,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'SEO',
      group: GROUP.SEO,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      releaseMonth: 'releaseMonth',
    },
    prepare({title, releaseMonth}: {title?: string; releaseMonth?: string}) {
      const monthYear = releaseMonth
        ? new Date(releaseMonth).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
        : ''
      return {
        title: title || 'Untitled',
        subtitle: monthYear,
        media: ClipboardListIcon,
      }
    },
  },
})
