import {defineType, defineField} from 'sanity'
import {LayoutDashboard} from 'lucide-react'

export const productPricing = defineType({
  name: 'productPricing',
  type: 'document',
  title: 'Product Pricing (from PIM)',
  icon: LayoutDashboard,
  description: 'Location-specific pricing from PIM',
  fields: [
    defineField({
      name: 'product',
      type: 'reference',
      title: 'Product',
      to: [{type: 'product'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'storeLocation',
      type: 'reference',
      title: 'Store Location',
      to: [{type: 'storeLocation'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      type: 'number',
      title: 'Price',
      validation: (Rule) => Rule.required().min(0).max(100),
    }),
    defineField({
      name: 'pricingTier',
      type: 'string',
      title: 'Pricing Tier',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Premium', value: 'premium'},
          {title: 'Value', value: 'value'},
          {title: 'Airport/Special', value: 'airport'},
        ],
      },
    }),
    defineField({
      name: 'effectiveDate',
      type: 'date',
      title: 'Effective Date',
      description: 'When this pricing takes effect',
    }),
    defineField({
      name: 'expirationDate',
      type: 'date',
      title: 'Expiration Date',
      description: 'When this pricing expires (optional)',
    }),
  ],
  preview: {
    select: {
      product: 'product.name',
      location: 'storeLocation.name',
      price: 'price',
    },
    prepare({product, location, price}: {product?: string; location?: string; price?: number}) {
      return {
        title: product || 'Unknown Product',
        subtitle: `${location || 'Unknown Location'} • $${price?.toFixed(2) || '0.00'}`,
      }
    },
  },
})
