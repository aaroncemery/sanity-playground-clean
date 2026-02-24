import {defineType, defineField, defineArrayMember} from 'sanity'
import {Star} from 'lucide-react'

export const promotion = defineType({
  name: 'promotion',
  type: 'document',
  title: 'Promotion',
  icon: Star,
  description: 'Limited time offers and deals',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Promotion Title',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      title: 'Description',
    }),
    defineField({
      name: 'promoCode',
      type: 'string',
      title: 'Promo Code',
      description: 'Optional code customers enter',
    }),
    defineField({
      name: 'menuItems',
      type: 'array',
      title: 'Applicable Menu Items',
      of: [defineArrayMember({type: 'reference', to: [{type: 'menuItem'}]})],
    }),
    defineField({
      name: 'discountType',
      type: 'string',
      title: 'Discount Type',
      options: {
        list: [
          {title: 'Percentage Off', value: 'percentage'},
          {title: 'Dollar Amount Off', value: 'amount'},
          {title: 'Fixed Price', value: 'fixed'},
          {title: 'BOGO', value: 'bogo'},
        ],
      },
    }),
    defineField({
      name: 'discountAmount',
      type: 'number',
      title: 'Discount Amount',
      description: 'Percentage (0-100) or dollar amount',
    }),
    defineField({
      name: 'startDate',
      type: 'datetime',
      title: 'Start Date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'endDate',
      type: 'datetime',
      title: 'End Date',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'regions',
      type: 'array',
      title: 'Available Regions',
      of: [defineArrayMember({type: 'reference', to: [{type: 'region'}]})],
      description: 'Leave empty for all regions',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      startDate: 'startDate',
      endDate: 'endDate',
    },
    prepare({title, startDate, endDate}: {title?: string; startDate?: string; endDate?: string}) {
      const now = new Date()
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null
      const isActive = start && end && now >= start && now <= end
      return {
        title: `${isActive ? '🟢' : '⚪'} ${title || 'Untitled Promotion'}`,
        subtitle: `${startDate ? new Date(startDate).toLocaleDateString() : 'No start'} → ${endDate ? new Date(endDate).toLocaleDateString() : 'No end'}`,
      }
    },
  },
})
