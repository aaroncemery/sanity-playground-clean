import {defineField, defineType} from 'sanity'
import {ExternalLinkIcon, LinkIcon, MergeIcon} from 'lucide-react'

export const redirect = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  icon: MergeIcon,
  description:
    'Create URL redirects for your website. Use internal redirects for pages within your site, and external redirects for linking to other domains.',
  fields: [
    defineField({
      name: 'from',
      type: 'string',
      title: 'From Path',
      description:
        'The path to redirect from (e.g., /old-page or /blog/old-post). Must start with /',
      placeholder: '/old-page',
      validation: (rule) => [
        rule.required().error('Source path is required'),
        rule.custom((value) => {
          if (!value) return true
          if (!value.startsWith('/')) {
            return 'Path must start with / (e.g., /old-page)'
          }
          // Check for query params or hashes (not typically supported in middleware)
          if (value.includes('?') || value.includes('#')) {
            return 'Path should not include query parameters (?) or hash (#)'
          }
          return true
        }),
      ],
    }),
    defineField({
      name: 'to',
      type: 'string',
      title: 'To Path/URL',
      description: 'Internal: /new-page | External: https://example.com',
      placeholder: '/new-page or https://example.com',
      validation: (rule) => [
        rule.required().error('Destination path or URL is required'),
        rule.custom((value, context) => {
          if (!value) return true

          const redirectType = (context.document as any)?.type

          // If internal, must start with /
          if (redirectType === 'internal' && !value.startsWith('/')) {
            return 'Internal redirects must start with / (e.g., /new-page)'
          }

          // If external, must be valid URL
          if (redirectType === 'external') {
            try {
              new URL(value)
              if (!value.startsWith('http://') && !value.startsWith('https://')) {
                return 'External redirects must include protocol (http:// or https://)'
              }
            } catch {
              return 'External redirects must be a valid URL (e.g., https://example.com)'
            }
          }

          return true
        }),
      ],
    }),
    defineField({
      name: 'type',
      type: 'string',
      title: 'Redirect Type',
      description:
        'Internal: Redirect to another page on your site | External: Redirect to another website',
      options: {
        list: [
          {title: 'Internal (same site)', value: 'internal'},
          {title: 'External (different site)', value: 'external'},
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      validation: (rule) => rule.required().error('Redirect type is required'),
    }),
    defineField({
      name: 'permanent',
      type: 'boolean',
      title: 'Permanent Redirect',
      description:
        'Permanent (301): Content moved permanently, search engines update | Temporary (302): Content temporarily moved',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      from: 'from',
      to: 'to',
      type: 'type',
      permanent: 'permanent',
    },
    prepare: ({from, to, type, permanent}) => ({
      title: `${from} → ${to}`,
      subtitle: `${type === 'internal' ? 'Internal' : 'External'} | ${permanent ? '301 Permanent' : '302 Temporary'}`,
      media: type === 'internal' ? LinkIcon : ExternalLinkIcon,
    }),
  },
})
