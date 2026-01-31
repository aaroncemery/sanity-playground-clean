import {defineField, defineType} from 'sanity'
import {SearchIcon} from 'lucide-react'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  description: 'Search engine optimization settings',
  fields: [
    defineField({
      name: 'title',
      title: 'SEO Title',
      type: 'string',
      description: 'Override the default page title for search engines (50-60 characters recommended)',
      validation: (rule) => [
        rule.max(60).warning('Titles longer than 60 characters may be truncated in search results'),
      ],
    }),
    defineField({
      name: 'description',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      description: 'Override the default page description for search engines (150-160 characters recommended)',
      validation: (rule) => [
        rule.max(160).warning('Descriptions longer than 160 characters may be truncated in search results'),
      ],
    }),
    defineField({
      name: 'image',
      title: 'SEO Image',
      type: 'image',
      description: 'Override the default image for search engines and social sharing',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from Search Engines',
      type: 'boolean',
      description: 'Prevent search engines from indexing this page',
      initialValue: false,
    }),
    defineField({
      name: 'hideFromLists',
      title: 'Hide from Site Lists',
      type: 'boolean',
      description: 'Hide this content from blog indexes and listing pages',
      initialValue: false,
    }),
  ],
})

export const openGraph = defineType({
  name: 'openGraph',
  title: 'Open Graph',
  type: 'object',
  description: 'Open Graph settings for social media sharing (Facebook, LinkedIn, etc.)',
  fields: [
    defineField({
      name: 'title',
      title: 'OG Title',
      type: 'string',
      description: 'Override title for social media (60-90 characters recommended)',
      validation: (rule) => [
        rule.max(90).warning('Titles longer than 90 characters may be truncated on social media'),
      ],
    }),
    defineField({
      name: 'description',
      title: 'OG Description',
      type: 'text',
      rows: 3,
      description: 'Override description for social media (150-200 characters recommended)',
      validation: (rule) => [
        rule.max(200).warning('Descriptions longer than 200 characters may be truncated on social media'),
      ],
    }),
    defineField({
      name: 'image',
      title: 'OG Image',
      type: 'image',
      description: 'Image for social media sharing (1200x630px recommended)',
      options: {
        hotspot: true,
      },
    }),
  ],
})
