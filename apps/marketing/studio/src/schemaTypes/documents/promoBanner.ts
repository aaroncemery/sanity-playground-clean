import {defineType, defineField} from 'sanity'
import {Megaphone} from 'lucide-react'
import {GROUP, GROUPS} from '../../utils/constant'

export const promoBanner = defineType({
  name: 'promoBanner',
  title: 'Promo Banner',
  type: 'document',
  icon: Megaphone,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      title: 'Show Banner',
      description: 'Master toggle — banner still respects start/end dates when enabled',
      group: GROUP.MAIN_CONTENT,
      initialValue: false,
    }),
    defineField({
      name: 'headline',
      type: 'string',
      title: 'Headline',
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => rule.required().error('Headline is required'),
    }),
    defineField({
      name: 'subtext',
      type: 'string',
      title: 'Subtext (optional)',
      description: 'Optional text below the headline',
      group: GROUP.MAIN_CONTENT,
      validation: (rule) => rule.required().warning('Subtext is nice to have'),
    }),
    defineField({
      name: 'cta',
      type: 'link',
      title: 'CTA (optional)',
      description: 'Optional call-to-action button. Supports internal pages or external URLs.',
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: 'startDate',
      type: 'datetime',
      title: 'Start Date (optional)',
      description: 'Banner becomes visible at this date/time',
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: 'endDate',
      type: 'datetime',
      title: 'End Date (optional)',
      description: 'Banner hides after this date/time',
      group: GROUP.MAIN_CONTENT,
    }),
  ],
  preview: {
    select: {
      enabled: 'enabled',
      headline: 'headline',
      startDate: 'startDate',
      endDate: 'endDate',
    },
    prepare({
      enabled,
      headline,
      startDate,
      endDate,
    }: {
      enabled: boolean
      headline: string
      startDate: string
      endDate: string
    }) {
      const dateRange =
        startDate || endDate
          ? `${startDate ? startDate.slice(0, 10) : '∞'} → ${endDate ? endDate.slice(0, 10) : '∞'}`
          : 'No date window'
      return {
        title: 'Promo Banner',
        subtitle: `${enabled ? 'LIVE' : 'Hidden'} · ${headline ?? 'No headline'} · ${dateRange}`,
        media: Megaphone,
      }
    },
  },
})
