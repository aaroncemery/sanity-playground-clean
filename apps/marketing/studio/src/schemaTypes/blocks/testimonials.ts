import {defineType, defineField, defineArrayMember} from 'sanity'
import {Quote} from 'lucide-react'

export const testimonials = defineType({
  name: 'testimonials',
  title: 'Testimonials Section',
  icon: Quote,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Section Title',
      description: 'Optional title for the testimonials section',
      validation: (rule) =>
        rule.max(100).warning('Title should be under 100 characters'),
    }),
    defineField({
      name: 'testimonials',
      type: 'array',
      title: 'Testimonials',
      description: 'Add customer testimonials',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'quote',
              type: 'text',
              title: 'Quote',
              rows: 4,
              validation: (rule) => [
                rule.required().error('Quote is required'),
                rule.max(500).warning('Quote should be under 500 characters for readability'),
              ],
            }),
            defineField({
              name: 'author',
              type: 'string',
              title: 'Author Name',
              validation: (rule) => rule.required().error('Author name is required'),
            }),
            defineField({
              name: 'role',
              type: 'string',
              title: 'Role/Title',
              description: 'Job title or role (e.g., "CEO", "Lead Developer")',
            }),
            defineField({
              name: 'company',
              type: 'string',
              title: 'Company',
              description: 'Company or organization name',
            }),
            defineField({
              name: 'avatar',
              type: 'image',
              title: 'Avatar',
              description: 'Optional profile photo',
              options: {
                hotspot: true,
              },
              fields: [
                defineField({
                  name: 'alt',
                  type: 'string',
                  title: 'Alt Text',
                  description: 'Describe the image for accessibility',
                }),
              ],
            }),
          ],
          preview: {
            select: {
              author: 'author',
              company: 'company',
              avatar: 'avatar',
            },
            prepare({author, company, avatar}) {
              return {
                title: author || 'Testimonial',
                subtitle: company || 'No company',
                media: avatar || Quote,
              }
            },
          },
        }),
      ],
      validation: (rule) => [
        rule.required().error('At least one testimonial is required'),
        rule.min(2).warning('Consider adding at least 2 testimonials'),
        rule.max(12).warning('Consider limiting to 12 testimonials for better readability'),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      testimonials: 'testimonials',
    },
    prepare({title, testimonials}) {
      const count = testimonials?.length || 0
      return {
        title: title || 'Testimonials Section',
        subtitle: `${count} testimonials`,
        media: Quote,
      }
    },
  },
})
