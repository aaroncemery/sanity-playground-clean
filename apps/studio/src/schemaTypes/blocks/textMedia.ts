import {defineType, defineField} from 'sanity'
import {Columns} from 'lucide-react'

export const textMedia = defineType({
  name: 'textMedia',
  title: 'Text + Media Section',
  icon: Columns,
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
      validation: (rule) => [
        rule.required().error('Heading is required'),
        rule.max(100).warning('Heading should be under 100 characters'),
      ],
    }),
    defineField({
      name: 'content',
      type: 'richText',
      title: 'Content',
      description: 'Rich text content for this section',
      validation: (rule) => rule.required().error('Content is required'),
    }),
    defineField({
      name: 'media',
      type: 'image',
      title: 'Media',
      description: 'Image for this section',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for accessibility',
          validation: (rule) =>
            rule.custom((alt, context) => {
              const parent = context.parent as {asset?: unknown}
              if (parent?.asset && !alt) {
                return 'Alt text is required for accessibility'
              }
              return true
            }),
        }),
      ],
      validation: (rule) => rule.required().error('Media is required'),
    }),
    defineField({
      name: 'mediaPosition',
      type: 'string',
      title: 'Media Position',
      description: 'Position of the media relative to text',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'right',
    }),
    defineField({
      name: 'reverse',
      type: 'boolean',
      title: 'Reverse for Alternating Layouts',
      description: 'Useful when stacking multiple text+media sections',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      mediaPosition: 'mediaPosition',
      media: 'media',
    },
    prepare({heading, mediaPosition, media}) {
      return {
        title: heading || 'Text + Media Section',
        subtitle: `Media: ${mediaPosition || 'right'}`,
        media: media || Columns,
      }
    },
  },
})
