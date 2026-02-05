import {defineAssetAspect, defineField} from 'sanity'

export default defineAssetAspect({
  name: 'copyright',
  title: 'copyright',
  type: 'object',
  fields: [
    defineField({
      name: 'string',
      title: 'Copyright Type',
      type: 'string',
    }),
    defineField({
      name: 'copyrightDate',
      title: 'Date',
      type: 'date',
    }),
  ],
})
