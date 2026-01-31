import {ImageIcon, LinkIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

const richTextMembers = [
  defineArrayMember({
    name: 'block',
    type: 'block',
    styles: [
      {title: 'Normal', value: 'normal'},
      {title: 'H2', value: 'h2'},
      {title: 'H3', value: 'h3'},
      {title: 'H4', value: 'h4'},
      {title: 'H5', value: 'h5'},
      {title: 'H6', value: 'h6'},
      {title: 'Quote', value: 'blockquote'},
    ],
    lists: [
      {title: 'Numbered', value: 'number'},
      {title: 'Bullet', value: 'bullet'},
    ],
    marks: {
      annotations: [
        defineField({
          name: 'link',
          type: 'object',
          title: 'External Link',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'href',
              type: 'url',
              title: 'URL',
              description: 'Link to external website (e.g., https://example.com)',
              validation: (rule) => [
                rule.required().error('URL is required'),
                rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: false,
                }),
              ],
            }),
            defineField({
              name: 'openInNewTab',
              type: 'boolean',
              title: 'Open in new tab',
              description: 'Open link in new browser tab',
              initialValue: true,
            }),
          ],
        }),
        defineField({
          name: 'internalLink',
          type: 'object',
          title: 'Internal Link',
          icon: LinkIcon,
          fields: [
            defineField({
              name: 'reference',
              type: 'reference',
              title: 'Reference',
              description: 'Link to another page on your site',
              to: [{type: 'blog'}],
              validation: (rule) => rule.required().error('Please select a page to link to'),
            }),
          ],
        }),
      ],
      decorators: [
        {title: 'Strong', value: 'strong'},
        {title: 'Emphasis', value: 'em'},
        {title: 'Code', value: 'code'},
        {title: 'Underline', value: 'underline'},
        {title: 'Strike', value: 'strike-through'},
      ],
    },
  }),
  defineArrayMember({
    name: 'image',
    title: 'Image',
    type: 'image',
    icon: ImageIcon,
    options: {
      hotspot: true,
    },
    fields: [
      defineField({
        name: 'alt',
        type: 'string',
        title: 'Alternative Text',
        description: 'Important for SEO and accessibility',
        validation: (rule) => rule.required().error('Alt text is required for accessibility'),
      }),
      defineField({
        name: 'caption',
        type: 'string',
        title: 'Caption',
        description: 'Optional caption displayed below the image',
      }),
    ],
  }),
]

export const richText = defineType({
  name: 'richText',
  type: 'array',
  of: richTextMembers,
})

export const memberTypes = richTextMembers.map((member) => member.name)

type Type = NonNullable<(typeof memberTypes)[number]>

export const customRichText = (
  type: Type[],
  options?: {name?: string; title?: string; group?: string},
) => {
  const {name} = options ?? {}
  const customMembers = richTextMembers.filter(
    (member) => member.name && type.includes(member.name),
  )
  return defineField({
    ...options,
    name: name ?? 'richText',
    type: 'array',
    of: customMembers,
  })
}
