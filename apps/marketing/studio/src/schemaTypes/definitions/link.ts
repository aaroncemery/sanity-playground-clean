import {defineType, defineField} from 'sanity'

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      type: 'string',
      title: 'Link Text',
      description: 'The text that will be displayed for this link',
      validation: (rule) =>
        rule.required().error('Link text is required').max(50).warning('Keep link text under 50 characters'),
    }),
    defineField({
      name: 'linkType',
      type: 'string',
      title: 'Link Type',
      description: 'Choose whether this links to a page on your site or an external URL',
      options: {
        list: [
          {title: 'Internal Page', value: 'internal'},
          {title: 'External URL', value: 'external'},
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      validation: (rule) => rule.required().error('Please select a link type'),
    }),
    defineField({
      name: 'internalLink',
      type: 'reference',
      title: 'Internal Page',
      description: 'Select a page from your site',
      to: [{type: 'page'}, {type: 'home'}],
      hidden: ({parent}) => parent?.linkType !== 'internal',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent?.linkType === 'internal' && !value) {
            return 'Please select an internal page'
          }
          return true
        }),
    }),
    defineField({
      name: 'externalUrl',
      type: 'url',
      title: 'External URL',
      description: 'Enter the full URL including https://',
      hidden: ({parent}) => parent?.linkType !== 'external',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as any
          if (parent?.linkType === 'external') {
            if (!value) {
              return 'Please enter an external URL'
            }
            if (!value.startsWith('http://') && !value.startsWith('https://')) {
              return 'URL must start with http:// or https://'
            }
            if (value.startsWith('http://')) {
              return {
                message: 'Consider using https:// for security',
                level: 'warning',
              } as any
            }
          }
          return true
        }),
    }),
    defineField({
      name: 'openInNewTab',
      type: 'boolean',
      title: 'Open in New Tab',
      description: 'Open this link in a new browser tab (recommended for external links)',
      hidden: ({parent}) => parent?.linkType !== 'external',
      initialValue: false,
    }),
    defineField({
      name: 'ariaLabel',
      type: 'string',
      title: 'ARIA Label (Optional)',
      description: 'Descriptive label for screen readers when link text is not descriptive enough',
      validation: (rule) => rule.max(100),
    }),
  ],
  preview: {
    select: {
      text: 'text',
      linkType: 'linkType',
      internalLink: 'internalLink.title',
      externalUrl: 'externalUrl',
    },
    prepare({text, linkType, internalLink, externalUrl}) {
      const destination = linkType === 'internal' ? internalLink : externalUrl
      return {
        title: text || 'Untitled Link',
        subtitle: destination ? `→ ${destination}` : 'No destination set',
      }
    },
  },
})
