import {defineType, defineField} from 'sanity'
import {ArrowUpRight} from 'lucide-react'

export const upgradeMap = defineType({
  name: 'upgradeMap',
  type: 'document',
  title: 'Upgrade Map',
  icon: ArrowUpRight,
  description:
    'Maps a regular item to its upgraded version. Drives the "combo upgrade" reward variant.',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Internal Name',
      description: 'e.g., "Regular Combo → Large Combo"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sourceItem',
      type: 'reference',
      title: 'Source Item (in cart)',
      description: 'The item the customer currently has',
      to: [{type: 'menuItem'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'upgradeItem',
      type: 'reference',
      title: 'Upgrade Item',
      description: 'The upgraded version offered to the customer',
      to: [{type: 'menuItem'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priceDelta',
      type: 'number',
      title: 'Price Delta ($)',
      description: 'Additional cost for the upgrade',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'bonusCopy',
      type: 'string',
      title: 'Bonus Copy',
      description: 'e.g., "Upgrade to Large for just $1.50 more!"',
    }),
    defineField({
      name: 'enabled',
      type: 'boolean',
      title: 'Enabled',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      name: 'name',
      delta: 'priceDelta',
      enabled: 'enabled',
    },
    prepare({name, delta, enabled}: Record<string, any>) {
      return {
        title: `${enabled ? '🟢' : '🔴'} ${name || 'Untitled Upgrade'}`,
        subtitle: typeof delta === 'number' ? `+$${delta.toFixed(2)}` : 'No delta set',
      }
    },
  },
})
