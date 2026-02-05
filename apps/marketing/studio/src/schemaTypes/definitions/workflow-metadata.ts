import {defineType, defineField} from 'sanity'

export const workflowMetadata = defineType({
  name: 'workflowMetadata',
  title: 'Workflow Metadata',
  type: 'object',
  fields: [
    defineField({
      name: 'workflowStatus',
      type: 'workflowStatus',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'submittedBy',
      title: 'Submitted By',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'approvedBy',
      title: 'Approved By',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'rejectionReason',
      title: 'Rejection Reason',
      type: 'text',
      hidden: ({parent}) => parent?.workflowStatus !== 'rejected',
    }),
  ],
})
