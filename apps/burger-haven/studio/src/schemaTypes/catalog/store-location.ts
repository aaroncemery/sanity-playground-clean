import {defineType, defineField} from 'sanity'
import {MapPin} from 'lucide-react'

export const storeLocation = defineType({
  name: 'storeLocation',
  type: 'document',
  title: 'Store Location',
  icon: MapPin,
  description: 'Physical store locations from PIM',
  fields: [
    defineField({
      name: 'storeId',
      type: 'string',
      title: 'Store ID',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      type: 'string',
      title: 'Store Name',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'address',
      type: 'object',
      title: 'Address',
      fields: [
        defineField({name: 'street', type: 'string', title: 'Street'}),
        defineField({name: 'city', type: 'string', title: 'City'}),
        defineField({name: 'state', type: 'string', title: 'State'}),
        defineField({name: 'zip', type: 'string', title: 'ZIP Code'}),
      ],
    }),
    defineField({
      name: 'region',
      type: 'string',
      title: 'Region',
      options: {
        list: [
          {title: 'California', value: 'california'},
          {title: 'Georgia', value: 'georgia'},
          {title: 'Texas', value: 'texas'},
        ],
      },
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
  ],
  preview: {
    select: {
      title: 'name',
      city: 'address.city',
      state: 'address.state',
      region: 'region',
    },
    prepare({title, city, state, region}: {title?: string; city?: string; state?: string; region?: string}) {
      return {
        title: title || 'Unknown Location',
        subtitle: `${city || ''}, ${state || ''} • ${region || 'unknown region'}`,
      }
    },
  },
})
