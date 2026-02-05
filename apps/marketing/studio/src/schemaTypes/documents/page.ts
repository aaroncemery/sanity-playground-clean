import {defineType, defineField, defineArrayMember} from 'sanity'
import {FileText} from 'lucide-react'
import {GROUP, GROUPS} from '../../utils/constant'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: FileText,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Page Title',
      description: 'The main title of the page',
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => [
        rule.required().error('Title is required'),
        rule.max(100).warning('Title should be under 100 characters for best SEO'),
      ],
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      description: 'URL-friendly identifier for the page',
      group: GROUP.MAIN_CONTENT,
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => [
        rule.required().error('Slug is required'),
        rule.custom((slug) => {
          if (!slug?.current) return true
          // No prefix validation - pages use clean slugs like "about", "pricing"
          if (slug.current.startsWith('/')) {
            return 'Slug should not start with a forward slash'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'pageSections',
      type: 'array',
      title: 'Page Sections',
      description: 'Add and arrange sections for this page',
      group: GROUP.MAIN_CONTENT,
      of: [
        defineArrayMember({type: 'hero'}),
        defineArrayMember({type: 'features'}),
        defineArrayMember({type: 'textMedia'}),
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
      slug: 'slug.current',
      seoNoIndex: 'seo.noIndex',
    },
    prepare({title, slug, seoNoIndex}) {
      return {
        title: title || 'Untitled Page',
        subtitle: slug ? `/${slug}` : 'No slug',
        media: FileText,
        // Add emoji indicator for SEO status
        ...(seoNoIndex && {
          title: `🚫 ${title || 'Untitled Page'}`,
        }),
      }
    },
  },
})
