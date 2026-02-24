import {defineType, defineField, defineArrayMember} from 'sanity'
import {Sparkles} from 'lucide-react'

export const seasonalCampaign = defineType({
  name: 'seasonalCampaign',
  type: 'document',
  title: 'Seasonal Campaign',
  icon: Sparkles,
  description: 'Grouped menu launches (Summer Menu, Holiday Specials, etc.)',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Campaign Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'title'},
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
    }),
    defineField({
      name: 'launchDate',
      type: 'date',
      title: 'Launch Date',
    }),
    defineField({
      name: 'endDate',
      type: 'date',
      title: 'End Date',
    }),
    defineField({
      name: 'menuItems',
      type: 'array',
      title: 'Menu Items',
      of: [defineArrayMember({type: 'reference', to: [{type: 'menuItem'}]})],
    }),
    defineField({
      name: 'promotions',
      type: 'array',
      title: 'Promotions',
      of: [defineArrayMember({type: 'reference', to: [{type: 'promotion'}]})],
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero Image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {
      title: 'title',
      launchDate: 'launchDate',
      media: 'heroImage',
    },
    prepare({title, launchDate, media}: {title?: string; launchDate?: string; media?: unknown}) {
      return {
        title: title || 'Untitled Campaign',
        subtitle: launchDate ? `Launches ${launchDate}` : 'No launch date',
        media,
      }
    },
  },
})
