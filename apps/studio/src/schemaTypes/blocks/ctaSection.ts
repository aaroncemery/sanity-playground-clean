import {defineType, defineField} from 'sanity'
import {Target} from 'lucide-react'

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'CTA Section',
  icon: Target,
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
      validation: (rule) => [
        rule.required().error('Heading is required'),
        rule.max(100).warning('Heading should be under 100 characters for impact'),
      ],
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      description: 'Optional supporting text',
      rows: 2,
      validation: (rule) => rule.max(250).warning('Description should be under 250 characters'),
    }),
    defineField({
      name: 'primaryButton',
      type: 'link',
      title: 'Primary Button',
      validation: (rule) => rule.required().error('Primary button is required'),
    }),
    defineField({
      name: 'secondaryButton',
      type: 'link',
      title: 'Secondary Button',
      description: 'Optional secondary button',
    }),
    defineField({
      name: 'backgroundVariant',
      type: 'string',
      title: 'Background Style',
      description: 'Choose the background appearance',
      options: {
        list: [
          {title: 'Neutral', value: 'neutral'},
          {title: 'Accent', value: 'accent'},
          {title: 'Gradient', value: 'gradient'},
        ],
        layout: 'radio',
      },
      initialValue: 'neutral',
    }),
  ],
  preview: {
    select: {
      heading: 'heading',
      backgroundVariant: 'backgroundVariant',
    },
    prepare({heading, backgroundVariant}) {
      return {
        title: heading || 'CTA Section',
        subtitle: `Background: ${backgroundVariant || 'neutral'}`,
        media: Target,
      }
    },
  },
})
