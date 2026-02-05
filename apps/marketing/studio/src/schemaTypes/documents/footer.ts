import {defineType, defineField, defineArrayMember} from 'sanity'
import {PanelBottom} from 'lucide-react'

export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  icon: PanelBottom,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Footer Title',
      description: 'Internal title for this footer configuration',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'branding',
      type: 'object',
      title: 'Branding Section',
      fields: [
        defineField({
          name: 'companyName',
          type: 'string',
          title: 'Company Name',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'tagline',
          type: 'text',
          title: 'Tagline',
          description: 'Short description displayed under company name',
          rows: 2,
          validation: (rule) => rule.max(150),
        }),
        defineField({
          name: 'logo',
          type: 'image',
          title: 'Logo Image (Optional)',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'sections',
      type: 'array',
      title: 'Footer Sections',
      description: 'Organize links into labeled sections',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerSection',
          title: 'Footer Section',
          fields: [
            defineField({
              name: 'heading',
              type: 'string',
              title: 'Section Heading',
              description: 'The label for this group of links',
              validation: (rule) => rule.required().max(30),
            }),
            defineField({
              name: 'links',
              type: 'array',
              title: 'Links',
              of: [
                defineArrayMember({
                  type: 'link',
                }),
              ],
              validation: (rule) =>
                rule.min(1).max(10).warning('Consider limiting to 10 links per section'),
            }),
          ],
          preview: {
            select: {
              heading: 'heading',
              links: 'links',
            },
            prepare({heading, links}) {
              const count = links?.length || 0
              return {
                title: heading || 'Untitled Section',
                subtitle: `${count} link${count !== 1 ? 's' : ''}`,
              }
            },
          },
        }),
      ],
      validation: (rule) =>
        rule.min(1).max(6).warning('Consider limiting to 6 sections for better layout'),
    }),
    defineField({
      name: 'socialLinks',
      type: 'array',
      title: 'Social Media Links',
      description: 'Links to social media profiles',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              title: 'Platform',
              options: {
                list: [
                  {title: 'Twitter / X', value: 'twitter'},
                  {title: 'GitHub', value: 'github'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'Discord', value: 'discord'},
                  {title: 'Slack', value: 'slack'},
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'Instagram', value: 'instagram'},
                ],
                layout: 'dropdown',
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              type: 'url',
              title: 'Profile URL',
              validation: (rule) =>
                rule.required().uri({
                  scheme: ['http', 'https'],
                }),
            }),
            defineField({
              name: 'ariaLabel',
              type: 'string',
              title: 'ARIA Label',
              description: 'Accessible label (e.g., "Follow us on Twitter")',
              validation: (rule) => rule.max(50),
            }),
          ],
          preview: {
            select: {
              platform: 'platform',
              url: 'url',
            },
            prepare({platform, url}) {
              return {
                title: platform
                  ? platform.charAt(0).toUpperCase() + platform.slice(1)
                  : 'Social Link',
                subtitle: url,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'copyrightText',
      type: 'string',
      title: 'Copyright Text',
      description: 'Text displayed at bottom of footer. Year will be added automatically.',
    }),
    defineField({
      name: 'legalLinks',
      type: 'array',
      title: 'Legal Links',
      description: 'Privacy policy, terms of service, etc.',
      of: [
        defineArrayMember({
          type: 'link',
        }),
      ],
      validation: (rule) => rule.max(5),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sectionCount: 'sections.length',
    },
    prepare({title, sectionCount}) {
      return {
        title: title || 'Footer',
        subtitle: `${sectionCount || 0} section${sectionCount !== 1 ? 's' : ''}`,
      }
    },
  },
})
