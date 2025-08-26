import {defineField, defineType} from 'sanity'

export const counter = defineType({
  name: 'counter',
  title: 'Counter',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      title: 'Counter Name',
      validation: (rule) => rule.required().error('Counter name is required'),
    }),
    defineField({
      name: 'value',
      type: 'number',
      title: 'Current Value',
      initialValue: 0,
    }),
  ],
})
