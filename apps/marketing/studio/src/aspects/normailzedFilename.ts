import {defineAssetAspect, defineField} from 'sanity'

export default defineAssetAspect({
  name: 'normailzedFilename',
  title: 'normailzed filename',
  type: 'object',
  fields: [
    defineField({
      name: 'string',
      title: 'Plain String',
      type: 'string',
    }),
  ],
})
