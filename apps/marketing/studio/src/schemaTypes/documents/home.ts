import {defineType, defineField, defineArrayMember} from 'sanity'
import {Home} from 'lucide-react'
import {GROUP, GROUPS} from '../../utils/constant'

export const home = defineType({
  name: 'home',
  title: 'Homepage',
  type: 'document',
  icon: Home,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Page Title',
      description: 'Internal title for the homepage',
      group: GROUP.MAIN_CONTENT,
      initialValue: 'Homepage',
      validation: (rule) => rule.required().error('Title is required'),
    }),
    defineField({
      name: 'pageSections',
      type: 'array',
      title: 'Page Sections',
      description: 'Add and arrange sections for the homepage',
      group: GROUP.MAIN_CONTENT,
      of: [
        defineArrayMember({type: 'hero'}),
        defineArrayMember({type: 'features'}),
        defineArrayMember({type: 'textMedia'}),
        defineArrayMember({type: 'cta'}),
        defineArrayMember({type: 'ctaSection'}),
        defineArrayMember({type: 'faqSection'}),
        defineArrayMember({type: 'statsSection'}),
        defineArrayMember({type: 'testimonials'}),
      ],
      options: {
        sortable: true,
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
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title || 'Homepage',
        subtitle: '🏠 Singleton Document',
        media: Home,
      }
    },
  },
})
