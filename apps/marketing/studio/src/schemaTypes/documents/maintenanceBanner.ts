import {defineType, defineField} from 'sanity'
import {AlertTriangle} from 'lucide-react'
import {GROUP, GROUPS} from '../../utils/constant'

export const maintenanceBanner = defineType({
  name: 'maintenanceBanner',
  title: 'Maintenance Banner',
  type: 'document',
  icon: AlertTriangle,
  groups: GROUPS,
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      title: 'Show Banner',
      description: 'Toggle the banner on or off globally',
      group: GROUP.MAIN_CONTENT,
      initialValue: false,
    }),
    defineField({
      name: 'message',
      type: 'text',
      title: 'Message',
      description: 'The message displayed to site visitors',
      group: GROUP.MAIN_CONTENT,
      rows: 3,
      validation: (rule) => rule.required().error('A message is required'),
    }),
    defineField({
      name: 'severity',
      type: 'string',
      title: 'Severity',
      group: GROUP.MAIN_CONTENT,
      options: {
        list: [
          {title: 'Info (blue)', value: 'info'},
          {title: 'Warning (yellow)', value: 'warning'},
          {title: 'Error (red)', value: 'error'},
        ],
        layout: 'radio',
      },
      initialValue: 'info',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'scheduledStart',
      type: 'datetime',
      title: 'Scheduled Start (optional)',
      description: 'If set, the banner will only show from this date/time onward',
      group: GROUP.MAIN_CONTENT,
    }),
    defineField({
      name: 'scheduledEnd',
      type: 'datetime',
      title: 'Scheduled End (optional)',
      description: 'If set, the banner will hide after this date/time',
      group: GROUP.MAIN_CONTENT,
    }),
  ],
  preview: {
    select: {
      enabled: 'enabled',
      severity: 'severity',
      message: 'message',
    },
    prepare({enabled, severity, message}: {enabled: boolean; severity: string; message: string}) {
      return {
        title: 'Maintenance Banner',
        subtitle: `${enabled ? 'LIVE' : 'Hidden'} · ${severity ?? 'info'} · ${message ?? 'No message set'}`,
        media: AlertTriangle,
      }
    },
  },
})
