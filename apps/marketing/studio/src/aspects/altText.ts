import {defineAssetAspect, defineField} from 'sanity'

export default defineAssetAspect({
  name: 'altText',
  title: 'Alt Text',
  type: 'object',
  fields: [
    defineField({
      name: 'string',
      title: 'Plain String',
      type: 'string',
    }),
  ],
})
