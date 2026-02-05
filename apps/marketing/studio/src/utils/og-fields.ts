import {defineField} from 'sanity'

import {GROUP} from './constant'

export const ogFields = [
  defineField({
    name: 'ogTitle',
    title: 'Open graph title override',
    description:
      'This will override the title for the page. If left blank it will inherit the page title.',
    type: 'string',
    validation: (rule) => rule.warning('A page title is required'),
    group: GROUP.OG,
  }),
  defineField({
    name: 'ogDescription',
    title: 'Open graph description override',
    description:
      'This will override the description for the page. If left blank it will inherit the page description.',
    type: 'text',
    rows: 2,
    validation: (rule) => [
      rule.warning('A description is required'),
      rule.max(155).warning('Description should be less than 155 characters'),
    ],
    group: GROUP.OG,
  }),
]
