import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {presentationTool} from 'sanity/presentation'
import {getPresentationUrl} from './src/utils/helper'
import {locations} from './location'
import {documentInternationalization} from '@sanity/document-internationalization'
import {structure} from './src/structure'
import {assist} from '@sanity/assist'

import {
  SmartPublishAction,
  ApproveAction,
  RejectAction,
  ResetToDraftAction,
} from './src/actions/workflowAction'

export default defineConfig({
  name: 'default',
  title: 'Sanity Studio Playground',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'a09jbdjz',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({structure}),
    visionTool(),
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
    documentInternationalization({
      supportedLanguages: [
        {id: 'en', title: 'English'},
        {id: 'es', title: 'Spanish'},
        {id: 'zh', title: 'Chinese (Simplified)'},
        {id: 'de', title: 'German'},
        {id: 'fr', title: 'French'},
        {id: 'pt', title: 'Portuguese'},
      ],
      schemaTypes: schemaTypes.map((type) => type.name),
    }),
    assist({
      translate: {
        // Style guide for the translation agent. Max 2000 chars.
        styleguide: 'Be extremely formal and precise. Mimick Spock from Star Trek.',
        document: {
          // The name of the field that holds the current language
          // in the form of a language code e.g. 'en', 'fr', 'nb_NO'.
          // Required
          languageField: 'language',
          // Optional extra filter for document types.
          // If not set, translation is enabled for all documents
          // that has a field with the name defined above.
          documentTypes: ['product', 'blog'],
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      // List of document types that have workflow
      const workflowEnabledTypes = ['product'] // Add your document types here

      // Safely get document type name with explicit type checking
      let documentType: string | undefined

      try {
        if (typeof context.schemaType === 'string') {
          documentType = context.schemaType
        } else if (context.schemaType && (context.schemaType as any).name) {
          documentType = (context.schemaType as any).name
        }
      } catch {
        // If anything fails, just return the original actions
        return prev
      }

      if (!documentType || !workflowEnabledTypes.includes(documentType)) {
        return prev
      }

      // For workflow-enabled documents, replace the default publish action
      // with our smart publish action and add reviewer actions
      const filteredActions = prev.filter((action) => action.action !== 'publish')

      return [
        SmartPublishAction, // Replaces the default publish button
        ApproveAction, // For reviewers
        RejectAction, // For reviewers
        ResetToDraftAction, // For rejected documents
        ...filteredActions, // Keep other default actions (duplicate, delete, etc.)
      ]
    },
  },
})
