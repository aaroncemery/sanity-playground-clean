import {defineType, defineField} from 'sanity'
import {Heading} from 'lucide-react'

export const hero = defineType({
  name: 'hero',
  title: 'Hero Section',
  icon: Heading,
  type: 'object',
  fields: [
    defineField({
      name: 'headline',
      type: 'string',
      title: 'Headline',
      description: 'Main headline for the hero section',
      validation: (rule) => [
        rule.required().error('Headline is required'),
        rule.max(120).warning('Headline should be under 120 characters for impact'),
      ],
    }),
    defineField({
      name: 'subtext',
      type: 'text',
      title: 'Subtext',
      description: 'Supporting text below the headline',
      rows: 3,
      validation: (rule) =>
        rule.max(300).warning('Subtext should be under 300 characters for readability'),
    }),
    defineField({
      name: 'primaryCta',
      type: 'link',
      title: 'Primary CTA',
      description: 'Main call-to-action button',
    }),
    defineField({
      name: 'secondaryCta',
      type: 'link',
      title: 'Secondary CTA',
      description: 'Optional secondary button',
    }),
    defineField({
      name: 'media',
      type: 'image',
      title: 'Media',
      description: 'Optional hero image or graphic',
      options: {
        hotspot: true,
        // MEDIA LIBRARY FILTERS
        mediaLibrary: {
          filters: [
            {
              name: 'Hero images',
              query: 'defined(aspects.assetUse) && aspects.assetUse == "hero"',
            },
          ],
        },
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
    }),
    defineField({
      name: 'variant',
      type: 'string',
      title: 'Layout Variant',
      description: 'Choose the hero layout style',
      options: {
        list: [
          {title: 'Centered', value: 'centered'},
          {title: 'Left Aligned', value: 'left-aligned'},
        ],
        layout: 'radio',
      },
      initialValue: 'centered',
    }),
    defineField({
      name: 'backgroundVariant',
      type: 'string',
      title: 'Background Style',
      description: 'Choose the background appearance',
      options: {
        list: [
          {title: 'Light', value: 'light'},
          {title: 'Dark', value: 'dark'},
          {title: 'Gradient', value: 'gradient'},
        ],
        layout: 'radio',
      },
      initialValue: 'light',
    }),
  ],
  preview: {
    select: {
      headline: 'headline',
      variant: 'variant',
      media: 'media',
    },
    prepare({headline, variant, media}) {
      return {
        title: headline || 'Hero Section',
        subtitle: variant ? `Layout: ${variant}` : 'Hero',
        media: media || Heading,
      }
    },
  },
})
