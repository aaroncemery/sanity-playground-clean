import {defineType, defineField} from 'sanity'
import {MousePointerClick} from 'lucide-react'

export const cta = defineType({
  name: 'cta',
  title: 'Call to Action',
  icon: MousePointerClick,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Headline or title for the CTA',
      validation: (rule) => [
        rule.max(80).warning('Title should be under 80 characters for impact'),
      ],
    }),
    defineField({
      name: 'description',
      type: 'text',
      title: 'Description',
      description: 'Optional supporting text',
      rows: 2,
      validation: (rule) => rule.max(200).warning('Description should be under 200 characters'),
    }),
    defineField({
      name: 'buttons',
      type: 'array',
      title: 'Buttons',
      description: 'Add one or more action buttons',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'link',
              type: 'link',
              title: 'Button Link',
              validation: (rule) => rule.required().error('Button link is required'),
            }),
            defineField({
              name: 'variant',
              type: 'string',
              title: 'Button Style',
              description: 'Choose the button appearance',
              options: {
                list: [
                  {title: 'Primary', value: 'primary'},
                  {title: 'Secondary', value: 'secondary'},
                  {title: 'Outline', value: 'outline'},
                ],
                layout: 'radio',
              },
              initialValue: 'primary',
            }),
          ],
          preview: {
            select: {
              text: 'link.text',
              variant: 'variant',
            },
            prepare({text, variant}) {
              return {
                title: text || 'Button',
                subtitle: variant || 'primary',
              }
            },
          },
        },
      ],
      validation: (rule) => [
        rule.required().error('At least one button is required'),
        rule.max(3).warning('Keep to 3 buttons or fewer for better UX'),
      ],
    }),
    defineField({
      name: 'alignment',
      type: 'string',
      title: 'Alignment',
      description: 'How to align the content',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Center', value: 'center'},
          {title: 'Right', value: 'right'},
        ],
        layout: 'radio',
      },
      initialValue: 'center',
    }),
    defineField({
      name: 'size',
      type: 'string',
      title: 'Size',
      description: 'Choose the size of the CTA',
      options: {
        list: [
          {title: 'Small', value: 'small'},
          {title: 'Medium', value: 'medium'},
          {title: 'Large', value: 'large'},
        ],
        layout: 'radio',
      },
      initialValue: 'medium',
    }),
    defineField({
      name: 'style',
      type: 'string',
      title: 'Background Style',
      description: 'Choose the background appearance',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Subtle', value: 'subtle'},
          {title: 'Accent', value: 'accent'},
          {title: 'Card', value: 'card'},
        ],
        layout: 'radio',
      },
      initialValue: 'none',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      buttonCount: 'buttons.length',
      alignment: 'alignment',
      style: 'style',
    },
    prepare({title, buttonCount, alignment, style}) {
      const buttonText = buttonCount === 1 ? '1 button' : `${buttonCount || 0} buttons`
      return {
        title: title || 'Call to Action',
        subtitle: `${buttonText} • ${alignment || 'center'} • ${style || 'none'}`,
        media: MousePointerClick,
      }
    },
  },
})
