import {defineType, defineField} from 'sanity'

export const workflowStatus = defineType({
  name: 'workflowStatus',
  title: 'Workflow Status',
  type: 'string',
  options: {
    list: [
      {title: '📝 Draft', value: 'draft'},
      {title: '👀 In Review', value: 'in-review'},
      {title: '✅ Approved', value: 'approved'},
      {title: '🚀 Published', value: 'published'},
      {title: '❌ Rejected', value: 'rejected'},
    ],
  },
  initialValue: 'draft',
  readOnly: ({document}) => {
    return document?.workflowStatus === 'published'
  },
})
