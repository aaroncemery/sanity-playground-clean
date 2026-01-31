import {defineConfig, QUOTA_EXCLUDED_RELEASES_ENABLED} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {presentationTool} from 'sanity/presentation'
import {getPresentationUrl} from './src/utils/helper'
import {locations} from './location'

import {
  SmartPublishAction,
  ApproveAction,
  RejectAction,
  ResetToDraftAction,
} from './src/actions/workflowAction'

export default defineConfig({
  name: 'default',
  title: 'Sanity Studio Playground',

  projectId: 'a09jbdjz',
  dataset: 'production',

  plugins: [
    structureTool(),
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
  ],

  schema: {
    types: schemaTypes,
  },
  [QUOTA_EXCLUDED_RELEASES_ENABLED]: true,

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
