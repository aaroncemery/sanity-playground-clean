import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'
import {FileTextIcon} from 'lucide-react'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {GROUP, GROUPS} from '../../utils/constant'
import {ogFields} from '../../utils/og-fields'
import {seoFields} from '../../utils/seo-fields'
import {isUnique} from '../../utils/slug'

export const blog = defineType({
  name: 'blog',
  title: 'Blog',
  icon: FileTextIcon,
  type: 'document',
  groups: GROUPS,
  orderings: [orderRankOrdering],
  description:
    'A post that will be published on the website. Add a title, description, autor, and content to create a new post.',
  fields: [
    orderRankField({type: 'blog'}),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description:
        'The title of the post. This will be displayed in the post list and on the post page.',
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      rows: 3,
      description:
        'The description of the post. This will be displayed in the post list and on the post page.',
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => [
        rule
          .min(140)
          .warning('The description should be at least 140 characters for optimal SEO visibility'),
        rule
          .max(160)
          .warning('The description should be less than 160 characters for optimal SEO visibility'),
      ],
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL',
      description: 'The web address of the post (this is automatically generated from the title)',
      group: GROUP.MAIN_CONTENT,
      options: {
        source: 'title',
        slugify: (input) => `blog/${input.toLowerCase().replace(/\s+/g, '-')}`,
        isUnique,
      },
      validation: (rule) => [
        rule.required().error('A URL slug is required'),
        rule.custom((value, context) => {
          if (!value?.current) return true
          if (!value.current.startsWith('blog')) {
            return 'URL slug must start with blog/'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: (() => {
        const now = new Date()
        const minutes = now.getMinutes()
        const roundedMinutes = Math.round(minutes / 15) * 15
        now.setMinutes(roundedMinutes, 0, 0)
        return now.toISOString()
      })(),
      options: {
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm',
        timeStep: 15,
        displayTimeZone: 'America/Los_Angeles',
      },
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => [rule.required().error('A published date is required')],
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'Main Image',
      description:
        'The main image of the post. This will be displayed in the post list and on the post page.',
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => rule.required().error('A main image is required'),
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'content',
      type: 'richText',
      title: 'Content',
      group: GROUP.MAIN_CONTENT,
    }),
    ...seoFields,
    ...ogFields,
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      isPrivate: 'seoNoIndex',
      isHidden: 'seoHideFromLists',
      slug: 'slug.current',
      publishDate: 'publishedAt',
    },
    prepare: ({title, media, isPrivate, isHidden, slug, publishDate}) => {
      // Status indicators
      const visibility = isPrivate ? '🔒 Private' : isHidden ? '🙈 Hidden' : '🌎 Public'

      // date
      const dateInfo = publishDate ? `📅 ${new Date(publishDate).toLocaleDateString()}` : '⏳ Draft'

      return {
        title: title || 'Untitled Blog Post',
        media,
        subtitle: `${visibility} | ${dateInfo} | ${slug ? `/${slug}` : ''}`,
      }
    },
  },
})
