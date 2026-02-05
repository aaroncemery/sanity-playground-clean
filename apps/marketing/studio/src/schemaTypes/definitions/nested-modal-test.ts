import {defineArrayMember, defineField, defineType} from 'sanity'

// Level 3 (innermost) - just basic rich text with no modal
export const nestedModalLevel3 = defineType({
  name: 'nestedModalLevel3',
  title: 'Nested Modal Level 3',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'block',
          type: 'block',
        }),
      ],
    }),
  ],
})

// Level 2 - rich text that can contain level 3 modals
export const nestedModalLevel2 = defineType({
  name: 'nestedModalLevel2',
  title: 'Nested Modal Level 2',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'block',
          type: 'block',
        }),
        defineArrayMember({
          name: 'nestedModalLevel3',
          type: 'nestedModalLevel3',
        }),
      ],
    }),
  ],
})

// Level 1 - rich text that can contain level 2 modals
export const nestedModalLevel1 = defineType({
  name: 'nestedModalLevel1',
  title: 'Nested Modal Level 1',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'block',
          type: 'block',
        }),
        defineArrayMember({
          name: 'nestedModalLevel2',
          type: 'nestedModalLevel2',
        }),
      ],
    }),
  ],
})

// Root level - rich text that can contain level 1 modals
export const nestedModalTestRichText = defineType({
  name: 'nestedModalTestRichText',
  title: 'Nested Modal Test Rich Text',
  type: 'array',
  of: [
    defineArrayMember({
      name: 'block',
      type: 'block',
    }),
    defineArrayMember({
      name: 'nestedModalLevel1',
      type: 'nestedModalLevel1',
    }),
  ],
})
