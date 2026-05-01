import {defineType, defineField, defineArrayMember} from 'sanity'
import {Tag} from 'lucide-react'

export const offerRule = defineType({
  name: 'offerRule',
  type: 'document',
  title: 'Offer Rule',
  icon: Tag,
  description:
    'Checkout upsell nudge rule — tiers, copy variants, targeting, and kill switch. Marketers control these without a code deploy.',
  groups: [
    {name: 'core', title: 'Core', default: true},
    {name: 'tiers', title: 'Tiers & Rewards'},
    {name: 'copy', title: 'Copy Variants'},
    {name: 'products', title: 'Suggested Products'},
    {name: 'targeting', title: 'Targeting'},
    {name: 'guards', title: 'Guards & Schedule'},
  ],
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Internal Name',
      description: 'Marketer-facing name (e.g., "Summer Upsell — Mobile")',
      group: 'core',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'enabled',
      type: 'boolean',
      title: 'Enabled (Kill Switch)',
      description: 'Turn the rule on/off without unpublishing',
      group: 'core',
      initialValue: true,
    }),
    defineField({
      name: 'priority',
      type: 'number',
      title: 'Priority',
      description: 'Lower number = higher priority. Used to order overlapping rules.',
      group: 'core',
      initialValue: 100,
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'tiers',
      type: 'array',
      title: 'Tiers',
      description:
        'Subtotal-based tiers. Each tier defines a threshold and a reward to unlock.',
      group: 'tiers',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'tier',
          fields: [
            defineField({
              name: 'label',
              type: 'string',
              title: 'Label',
              description: 'e.g., "Tier 1 — Entry"',
            }),
            defineField({
              name: 'lowerBound',
              type: 'number',
              title: 'Lower Bound ($)',
              description: 'Cart subtotal at which this tier becomes active',
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: 'target',
              type: 'number',
              title: 'Target ($)',
              description: 'Subtotal needed to unlock the reward',
              validation: (Rule) => Rule.required().min(0),
            }),
            defineField({
              name: 'rewardType',
              type: 'string',
              title: 'Reward Type',
              options: {
                list: [
                  {title: 'Percent Off Order', value: 'percentOff'},
                  {title: 'Dollar Off Order', value: 'dollarOff'},
                  {title: 'Free Item', value: 'freeItem'},
                  {title: 'Bonus Points', value: 'bonusPoints'},
                  {title: 'Combo Upgrade', value: 'comboUpgrade'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'rewardValue',
              type: 'number',
              title: 'Reward Value',
              description:
                'Numeric reward (e.g., 10 for "10% off", 200 for "200 bonus points")',
            }),
            defineField({
              name: 'rewardItem',
              type: 'reference',
              title: 'Reward Item',
              description: 'Required for "freeItem" reward type',
              to: [{type: 'menuItem'}],
            }),
          ],
          preview: {
            select: {
              label: 'label',
              lower: 'lowerBound',
              target: 'target',
              type: 'rewardType',
              value: 'rewardValue',
            },
            prepare({label, lower, target, type, value}: Record<string, any>) {
              const range = `$${lower?.toFixed(2) ?? '?'} → $${target?.toFixed(2) ?? '?'}`
              const reward =
                type === 'percentOff'
                  ? `${value}% off`
                  : type === 'dollarOff'
                    ? `$${value} off`
                    : type === 'bonusPoints'
                      ? `${value} bonus pts`
                      : type === 'freeItem'
                        ? 'Free item'
                        : type === 'comboUpgrade'
                          ? 'Combo upgrade'
                          : 'No reward'
              return {
                title: label || range,
                subtitle: `${range}  •  ${reward}`,
              }
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'copyVariants',
      type: 'array',
      title: 'Copy Variants',
      description:
        'Variants for A/B testing. Tokens: [GAP], [REWARD], [TARGET]. Amplitude assigns the variant; Sanity stores the copy.',
      group: 'copy',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'copyVariant',
          fields: [
            defineField({
              name: 'variantId',
              type: 'string',
              title: 'Variant ID',
              description: 'Maps to experiment variant (e.g., "A", "B", "C")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'headline',
              type: 'string',
              title: 'Headline',
              description: 'Tokens: [GAP], [REWARD], [TARGET]',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'body',
              type: 'text',
              rows: 2,
              title: 'Body',
              description: 'Supports the same tokens',
            }),
            defineField({
              name: 'cta',
              type: 'string',
              title: 'CTA',
              description: 'Button label (e.g., "Add a side")',
            }),
          ],
          preview: {
            select: {
              variantId: 'variantId',
              headline: 'headline',
            },
            prepare({variantId, headline}: Record<string, any>) {
              return {
                title: `Variant ${variantId || '?'}`,
                subtitle: headline,
              }
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'suggestedProducts',
      type: 'array',
      title: 'Manually Suggested Products',
      description:
        'Fallback suggestions when embeddings/rec engine are unavailable. Otherwise, use semantic similarity at runtime.',
      group: 'products',
      of: [defineArrayMember({type: 'reference', to: [{type: 'menuItem'}]})],
    }),

    defineField({
      name: 'channels',
      type: 'array',
      title: 'Channels',
      description: 'Empty = all channels',
      group: 'targeting',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: '📱 Mobile', value: 'mobile'},
          {title: '🌐 Web', value: 'web'},
          {title: '🖥️ Kiosk', value: 'kiosk'},
        ],
      },
    }),
    defineField({
      name: 'dayparts',
      type: 'array',
      title: 'Dayparts',
      description: 'Empty = all dayparts',
      group: 'targeting',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: '🥞 Breakfast', value: 'breakfast'},
          {title: '🍔 Lunch', value: 'lunch'},
          {title: '🍽️ Dinner', value: 'dinner'},
          {title: '🌙 Late Night', value: 'lateNight'},
        ],
      },
    }),

    defineField({
      name: 'marginFloor',
      type: 'number',
      title: 'Margin Floor (%)',
      description:
        'Minimum cart margin %. If cart margin drops below this, suppress the nudge.',
      group: 'guards',
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: 'scheduling',
      type: 'object',
      title: 'Scheduling',
      group: 'guards',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'startDate',
          type: 'datetime',
          title: 'Start Date',
        }),
        defineField({
          name: 'endDate',
          type: 'datetime',
          title: 'End Date',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      name: 'name',
      enabled: 'enabled',
      tiers: 'tiers',
      priority: 'priority',
    },
    prepare({name, enabled, tiers, priority}: Record<string, any>) {
      const tierCount = Array.isArray(tiers) ? tiers.length : 0
      return {
        title: `${enabled ? '🟢' : '🔴'} ${name || 'Untitled Rule'}`,
        subtitle: `${tierCount} tier${tierCount === 1 ? '' : 's'}  •  priority ${priority ?? '—'}`,
      }
    },
  },
})
