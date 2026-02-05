import {defineType, defineField, defineArrayMember} from 'sanity'
import {Menu} from 'lucide-react'

export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  icon: Menu,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Navigation Title',
      description: 'Internal title for this navigation configuration',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      type: 'object',
      title: 'Logo',
      fields: [
        defineField({
          name: 'text',
          type: 'string',
          title: 'Logo Text',
          description: 'Text to display as logo (if no image)',
        }),
        defineField({
          name: 'image',
          type: 'image',
          title: 'Logo Image',
          description: 'Optional logo image',
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
      name: 'navItems',
      type: 'array',
      title: 'Navigation Items',
      description: 'Add navigation links or mega menus',
      of: [
        defineArrayMember({
          name: 'navLink',
          type: 'object',
          title: 'Simple Link',
          icon: () => '🔗',
          fields: [
            defineField({
              name: 'link',
              type: 'link',
              title: 'Link',
            }),
          ],
          preview: {
            select: {
              text: 'link.text',
            },
            prepare({text}) {
              return {
                title: text || 'Untitled Link',
                subtitle: 'Simple Link',
              }
            },
          },
        }),
        defineArrayMember({
          name: 'megaNav',
          type: 'object',
          title: 'Mega Navigation',
          icon: () => '📋',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              title: 'Menu Title',
              description: 'The text displayed for this menu',
              validation: (rule) => rule.required().max(30),
            }),
            defineField({
              name: 'columns',
              type: 'array',
              title: 'Menu Columns',
              description: 'Organize dropdown items into columns',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'column',
                  title: 'Column',
                  fields: [
                    defineField({
                      name: 'heading',
                      type: 'string',
                      title: 'Column Heading (Optional)',
                      validation: (rule) => rule.max(30),
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
                      validation: (rule) => rule.min(1).max(8),
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
                        title: heading || 'Untitled Column',
                        subtitle: `${count} link${count !== 1 ? 's' : ''}`,
                      }
                    },
                  },
                }),
              ],
              validation: (rule) => rule.min(1).max(4).warning('Limit to 4 columns for best UX'),
            }),
          ],
          preview: {
            select: {
              title: 'title',
              columns: 'columns',
            },
            prepare({title, columns}) {
              const columnCount = columns?.length || 0
              return {
                title: title || 'Untitled Mega Nav',
                subtitle: `Mega Menu with ${columnCount} column${columnCount !== 1 ? 's' : ''}`,
              }
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'ctaButton',
      type: 'link',
      title: 'CTA Button',
      description: 'Primary call-to-action button in navigation',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      itemCount: 'navItems.length',
    },
    prepare({title, itemCount}) {
      return {
        title: title || 'Navigation',
        subtitle: `${itemCount || 0} item${itemCount !== 1 ? 's' : ''}`,
      }
    },
  },
})
