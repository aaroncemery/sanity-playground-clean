import {defineType, defineField, defineArrayMember} from 'sanity'
import {UtensilsCrossed} from 'lucide-react'

export const menuItem = defineType({
  name: 'menuItem',
  type: 'document',
  title: 'Menu Item',
  icon: UtensilsCrossed,
  description: 'Marketing enrichment of product catalog',
  fields: [
    defineField({
      name: 'product',
      type: 'crossDatasetReference',
      title: 'Product (from Catalog)',
      description:
        '🔗 Links to product from external PIM. Marketing cannot edit product details.',
      to: [
        {
          type: 'product',
          preview: {
            select: {
              title: 'name',
              subtitle: 'sku',
            },
          },
        },
      ],
      dataset: 'productcatalog',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'marketingName',
      type: 'string',
      title: 'Customer-Facing Name',
      description: 'The name customers see (can differ from internal PIM name)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      type: 'string',
      title: 'Marketing Tagline',
      description: 'Short, punchy description (e.g., "Stacked with flavor")',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 4,
      title: 'Full Description',
      description: 'Detailed menu item description for web/app',
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Hero Image',
      description: 'Main product image shown to customers',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'galleryImages',
      type: 'array',
      title: 'Additional Images',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
        }),
      ],
      description: 'Additional product photos',
    }),
    defineField({
      name: 'seasonalAvailability',
      type: 'object',
      title: 'Seasonal Availability',
      description: 'Limit availability by date/region',
      options: {collapsible: true},
      fields: [
        defineField({name: 'startDate', type: 'date', title: 'Available From'}),
        defineField({name: 'endDate', type: 'date', title: 'Available Until'}),
        defineField({
          name: 'regions',
          type: 'array',
          title: 'Available Regions',
          of: [defineArrayMember({type: 'reference', to: [{type: 'region'}]})],
          description: 'Leave empty for all regions',
        }),
      ],
    }),
    defineField({
      name: 'badges',
      type: 'array',
      title: 'Promotional Badges',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: '🆕 New!', value: 'new'},
          {title: '⏰ Limited Time', value: 'limited'},
          {title: '⭐ Fan Favorite', value: 'favorite'},
          {title: '💰 Value Deal', value: 'value'},
          {title: '🔥 Spicy', value: 'spicy'},
          {title: '🥗 Fresh', value: 'fresh'},
        ],
      },
    }),
    defineField({
      name: 'displayOrder',
      type: 'number',
      title: 'Menu Display Order',
      description: 'Lower numbers appear first',
      validation: (Rule) => Rule.integer().min(0),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Featured Item',
      description: 'Highlight on homepage/menu',
    }),
  ],
  preview: {
    select: {
      title: 'marketingName',
      media: 'heroImage',
      featured: 'featured',
    },
    prepare({title, media, featured}: {title?: string; media?: unknown; featured?: boolean}) {
      return {
        title: featured ? `⭐ ${title}` : (title || 'Unnamed Item'),
        subtitle: featured ? 'Featured Item' : 'Menu Item',
        media,
      }
    },
  },
})
