import {defineAssetAspect} from 'sanity'

export default defineAssetAspect({
  name: 'assetUse',
  title: 'asset use',
  type: 'string',
  options: {
    list: [
      {title: 'Hero', value: 'hero'},
      {title: 'ctaBanner', value: 'CTA Banner'},
    ],
    layout: 'radio',
  },
})
