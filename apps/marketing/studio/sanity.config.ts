import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {presentationTool} from 'sanity/presentation'
import {getPresentationUrl} from './src/utils/helper'
import {locations} from './location'
// import structure from './src/structure'
import {contentDashboardPlugin} from './src/plugins/content-dashboard'
import structure from './src/structure'

export default defineConfig({
  name: 'default',
  title: 'Sanity Studio Playground',

  projectId: 'a09jbdjz',
  dataset: 'production',

  mediaLibrary: {
    enabled: true,
  },
  auth: {
    loginMethod: 'token',
  },

  form: {
    // Disable the default asset source for images (use Media Library instead)
    image: {
      assetSources: (previousSources) => {
        return previousSources.filter((source) => source.name !== 'sanity-default')
      },
    },
    // Disable the default asset source for files (use Media Library instead)
    file: {
      assetSources: (previousSources) => {
        return previousSources.filter((source) => source.name !== 'sanity-default')
      },
    },
  },

  plugins: [
    structureTool({structure}),
    visionTool(),
    // DEMO: App SDK running inside Studio with zero external config
    contentDashboardPlugin(),
    presentationTool({
      resolve: {
        locations,
      },
      previewUrl: {
        origin: getPresentationUrl(),
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },

})
