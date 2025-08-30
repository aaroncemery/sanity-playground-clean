// schemas/workflowMetadata.ts
import {defineType} from 'sanity'

export const workflowMetadata = defineType({
  name: 'workflow.metadata',
  type: 'document',
  title: 'Workflow Metadata',
  fields: [
    // Core document reference
    {
      name: 'documentId',
      type: 'string',
      title: 'Document ID',
      description: 'ID of the document this workflow refers to',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'documentType',
      type: 'string',
      title: 'Document Type',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'documentTitle',
      type: 'string',
      title: 'Document Title',
      description: 'Cached title for performance',
    },

    // Workflow state
    {
      name: 'state',
      type: 'string',
      title: 'Workflow State',
      options: {
        list: [
          {title: '📝 Draft', value: 'draft'},
          {title: '👀 In Review', value: 'in-review'},
          {title: '✅ Approved', value: 'approved'},
          {title: '🚀 Published', value: 'published'},
          {title: '🔧 Changes Required', value: 'changes-required'},
        ],
      },
      initialValue: 'draft',
    },

    // Assignment & users
    {
      name: 'assignedTo',
      type: 'array',
      title: 'Assigned To',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'userId', type: 'string', title: 'User ID'},
            {name: 'userName', type: 'string', title: 'User Name'},
            {name: 'userEmail', type: 'string', title: 'User Email'},
            {
              name: 'role',
              type: 'string',
              title: 'Role',
              options: {
                list: ['reviewer', 'approver', 'editor'],
              },
            },
          ],
        },
      ],
    },
    {
      name: 'submittedBy',
      type: 'object',
      title: 'Submitted By',
      fields: [
        {name: 'userId', type: 'string'},
        {name: 'userName', type: 'string'},
        {name: 'userEmail', type: 'string'},
      ],
    },

    // Timestamps
    {
      name: 'submittedAt',
      type: 'datetime',
      title: 'Submitted At',
    },
    {
      name: 'dueDate',
      type: 'datetime',
      title: 'Due Date',
    },
    {
      name: 'approvedAt',
      type: 'datetime',
      title: 'Approved At',
    },
    {
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published At',
    },

    // Enhanced metadata for App SDK
    {
      name: 'priority',
      type: 'string',
      title: 'Priority',
      options: {
        list: [
          {title: '🔴 High', value: 'high'},
          {title: '🟡 Medium', value: 'medium'},
          {title: '🟢 Low', value: 'low'},
        ],
      },
      initialValue: 'medium',
    },
    {
      name: 'tags',
      type: 'array',
      title: 'Workflow Tags',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'number',
      title: 'Estimated Duration (hours)',
    },

    // Integration with built-in features
    {
      name: 'relatedTasks',
      type: 'array',
      title: 'Related Tasks',
      description: 'References to Sanity built-in tasks',
      of: [{type: 'string'}], // Task IDs from Sanity's task system
    },
    {
      name: 'comments',
      type: 'array',
      title: 'Workflow Comments',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'comment', type: 'text'},
            {name: 'author', type: 'string'},
            {name: 'timestamp', type: 'datetime'},
            {
              name: 'type',
              type: 'string',
              options: {
                list: ['comment', 'state_change', 'assignment'],
              },
            },
          ],
        },
      ],
    },

    // Rich history for analytics
    {
      name: 'history',
      type: 'array',
      title: 'State History',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'fromState', type: 'string'},
            {name: 'toState', type: 'string'},
            {name: 'timestamp', type: 'datetime'},
            {name: 'user', type: 'string'},
            {name: 'comment', type: 'text'},
            {name: 'duration', type: 'number', title: 'Time in previous state (minutes)'},
          ],
        },
      ],
    },

    // Analytics metadata
    {
      name: 'metrics',
      type: 'object',
      title: 'Workflow Metrics',
      fields: [
        {name: 'totalTimeInWorkflow', type: 'number', title: 'Total time in workflow (minutes)'},
        {name: 'timeInReview', type: 'number', title: 'Time in review (minutes)'},
        {name: 'numberOfRevisions', type: 'number', title: 'Number of revisions'},
        {name: 'numberOfRejections', type: 'number', title: 'Number of rejections'},
      ],
    },
  ],
  preview: {
    select: {
      title: 'documentTitle',
      state: 'state',
      assignedTo: 'assignedTo.0.userName',
      priority: 'priority',
    },
    prepare({
      title,
      state,
      assignedTo,
      priority,
    }: {
      title?: string
      state?: string
      assignedTo?: string
      priority?: string
    }) {
      const stateEmojis: Record<string, string> = {
        draft: '📝',
        'in-review': '👀',
        approved: '✅',
        published: '🚀',
        'changes-required': '🔧',
      }
      const priorityEmojis: Record<string, string> = {
        high: '🔴',
        medium: '🟡',
        low: '🟢',
      }

      return {
        title: `${stateEmojis[state || 'draft']} ${title || 'Untitled Document'}`,
        subtitle: `${priorityEmojis[priority || 'medium']} ${state || 'draft'} ${assignedTo ? `→ ${assignedTo}` : ''}`,
      }
    },
  },
})
