import {defineType, defineField, defineArrayMember} from 'sanity'
import {HelpCircle} from 'lucide-react'

export const faqSection = defineType({
  name: 'faqSection',
  title: 'FAQ Section',
  icon: HelpCircle,
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Section Title',
      description: 'Optional title for the FAQ section',
      validation: (rule) =>
        rule.max(100).warning('Title should be under 100 characters'),
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'FAQs',
      description: 'Add frequently asked questions',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              type: 'string',
              title: 'Question',
              validation: (rule) => [
                rule.required().error('Question is required'),
                rule.max(150).warning('Question should be under 150 characters'),
              ],
            }),
            defineField({
              name: 'answer',
              type: 'richText',
              title: 'Answer',
              description: 'Answer with optional rich text formatting',
              validation: (rule) => rule.required().error('Answer is required'),
            }),
          ],
          preview: {
            select: {
              question: 'question',
            },
            prepare({question}) {
              return {
                title: question || 'Question',
                subtitle: 'FAQ',
              }
            },
          },
        }),
      ],
      validation: (rule) => [
        rule.required().error('At least one FAQ is required'),
        rule.min(3).warning('Consider adding at least 3 FAQs'),
        rule.max(20).warning('Consider limiting to 20 FAQs for better readability'),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      faqs: 'faqs',
    },
    prepare({title, faqs}) {
      const count = faqs?.length || 0
      return {
        title: title || 'FAQ Section',
        subtitle: `${count} questions`,
        media: HelpCircle,
      }
    },
  },
})
