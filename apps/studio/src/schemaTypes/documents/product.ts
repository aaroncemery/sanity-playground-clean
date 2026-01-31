import {defineType, defineField, defineArrayMember} from 'sanity'
import {ScanBarcode} from 'lucide-react'

import {GROUP, GROUPS} from '../../utils/constant'
import {isUnique} from '../../utils/slug'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export const product = defineType({
  name: 'product',
  title: 'Product',
  icon: ScanBarcode,
  type: 'document',
  groups: GROUPS,
  orderings: [orderRankOrdering],
  description:
    'A product that will be published on the website. Add a title, description, autor, and content to create a new post.',
  fields: [
    orderRankField({type: 'product'}),
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description:
        'The title of the product. This will be displayed in the product list and on the product page.',
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => [
        rule.required().error('A title is required'),
        rule.min(3).warning('Title should be at least 3 characters'),
        rule.max(80).warning('Title should be less than 80 characters for optimal display'),
      ],
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'URL',
      description:
        'The web address of the product (this is automatically generated from the title)',
      group: GROUP.MAIN_CONTENT,
      options: {
        source: 'title',
        slugify: (input) => `product/${input.toLowerCase().replace(/\s+/g, '-')}`,
        isUnique,
      },
      validation: (rule) => [
        rule.required().error('A URL slug is required'),
        rule.custom((value, context) => {
          if (!value?.current) return true
          if (!value.current.startsWith('product')) {
            return 'URL slug must start with product/'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'pageSections',
      type: 'array',
      title: 'Page Sections',
      description: 'The sections of the product page',
      group: GROUP.MAIN_CONTENT,
      of: [defineArrayMember({type: 'hero'})],
      initialValue: [
        {type: 'hero', title: 'Hero'},
        {type: 'leftRightContent', title: 'Left Right Content'},
      ],
      options: {
        sortable: true,
        disableActions: ['add', 'remove', 'duplicate'],
      },
    }),
    defineField({
      name: 'seo',
      type: 'seo',
      title: 'SEO',
      group: GROUP.SEO,
    }),
    defineField({
      name: 'openGraph',
      type: 'openGraph',
      title: 'Open Graph',
      group: GROUP.OG,
    }),
    defineField({
      name: 'workflowMetadata',
      type: 'workflowMetadata',
      group: GROUP.WORKFLOW,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      status: 'workflowMetadata.workflowStatus',
    },
    prepare(selection) {
      const {title, status} = selection
      const statusEmojis: Record<string, string> = {
        draft: '📝',
        'in-review': '👀',
        approved: '✅',
        published: '🚀',
        rejected: '❌',
      }

      const formattedStatus = status
        ? status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')
        : 'Draft'
      return {
        title: title || 'Untitled',
        subtitle: `${statusEmojis[status as keyof typeof statusEmojis] || '📝'} ${formattedStatus}`,
      }
    },
  },
})
