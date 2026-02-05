// actions/workflowActions.ts
import React, {useState, useEffect} from 'react'
import {useDocumentOperation, useCurrentUser} from 'sanity'
import type {
  DocumentActionComponent,
  DocumentActionProps,
  DocumentActionDescription,
  SanityDocument,
} from 'sanity'

// Define our workflow status type
type WorkflowStatus = 'draft' | 'in-review' | 'approved' | 'published' | 'rejected'

// Define the shape of documents with workflow fields
interface WorkflowDocument extends SanityDocument {
  workflowMetadata?: {
    workflowStatus?: WorkflowStatus
    submittedAt?: string
    submittedBy?: string
    approvedAt?: string
    approvedBy?: string
    rejectionReason?: string
  }
}

// Type for our document action props with workflow document
interface WorkflowActionProps extends DocumentActionProps {
  draft: WorkflowDocument | null
  published: WorkflowDocument | null
}

// Smart Publish Action that changes based on workflow status
export const SmartPublishAction: DocumentActionComponent = (
  props: WorkflowActionProps,
): DocumentActionDescription | null => {
  const {patch, publish} = useDocumentOperation(props.id, props.type)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const currentUser = useCurrentUser()

  const currentStatus = props.draft?.workflowMetadata?.workflowStatus || 'draft'

  // Handle the completion of publishing (when draft becomes null)
  useEffect(() => {
    if (isProcessing && !props.draft && currentStatus === 'approved') {
      setIsProcessing(false)
    }
  }, [props.draft, isProcessing, currentStatus])

  // Configure button based on current workflow status
  let buttonConfig: {
    label: string
    icon: string
    disabled: boolean
    tone?: 'primary' | 'positive' | 'caution' | 'critical'
    action: () => void
  }

  switch (currentStatus) {
    case 'draft':
      buttonConfig = {
        label: 'Submit for Approval',
        icon: '📝',
        disabled: isProcessing,
        tone: 'primary',
        action: () => {
          setIsProcessing(true)
          patch.execute([
            {
              set: {
                'workflowMetadata.workflowStatus': 'in-review' as WorkflowStatus,
                'workflowMetadata.submittedAt': new Date().toISOString(),
                'workflowMetadata.submittedBy':
                  currentUser?.name || currentUser?.email || 'Unknown User',
              },
            },
          ])
          setIsProcessing(false)
          props.onComplete()
        },
      }
      break

    case 'in-review':
      buttonConfig = {
        label: 'In Review',
        icon: '👀',
        disabled: true, // Button is disabled when in review
        action: () => {
          // No action when in review - button is disabled
        },
      }
      break

    case 'approved':
      buttonConfig = {
        label: isProcessing ? 'Publishing...' : 'Publish',
        icon: '🚀',
        disabled: Boolean(publish.disabled) || isProcessing,
        tone: 'positive',
        action: () => {
          setIsProcessing(true)

          // Mark as published in workflow
          patch.execute([{set: {'workflowMetadata.workflowStatus': 'published' as WorkflowStatus}}])

          // Actually publish the document
          publish.execute()
          props.onComplete()
        },
      }
      break

    case 'published':
      buttonConfig = {
        label: 'Published',
        icon: '✅',
        disabled: true,
        tone: 'positive',
        action: () => {
          // No action needed - already published
        },
      }
      break

    case 'rejected':
      buttonConfig = {
        label: 'Rejected - Edit to Resubmit',
        icon: '❌',
        disabled: true,
        tone: 'critical',
        action: () => {
          // No action - user needs to edit document first
        },
      }
      break

    default:
      // Fallback to draft behavior
      buttonConfig = {
        label: 'Submit for Approval',
        icon: '📝',
        disabled: isProcessing,
        tone: 'primary',
        action: () => {
          setIsProcessing(true)
          patch.execute([
            {
              set: {
                'workflowMetadata.workflowStatus': 'in-review' as WorkflowStatus,
                'workflowMetadata.submittedAt': new Date().toISOString(),
                'workflowMetadata.submittedBy':
                  currentUser?.name || currentUser?.email || 'Unknown User',
              },
            },
          ])
          setIsProcessing(false)
          props.onComplete()
        },
      }
  }

  return {
    label: buttonConfig.label,
    icon: () => buttonConfig.icon,
    disabled: buttonConfig.disabled,
    tone: buttonConfig.tone,
    onHandle: buttonConfig.action,
  }
}

// Approve Action (for reviewers)
export const ApproveAction: DocumentActionComponent = (
  props: WorkflowActionProps,
): DocumentActionDescription | null => {
  const {patch} = useDocumentOperation(props.id, props.type)
  const [isApproving, setIsApproving] = useState<boolean>(false)
  const currentUser = useCurrentUser()

  // Only show for documents in review
  const canApprove = props.draft?.workflowMetadata?.workflowStatus === 'in-review'

  if (!canApprove) {
    return null
  }

  return {
    label: 'Approve',
    icon: () => '✅',
    disabled: isApproving,
    tone: 'positive',
    onHandle: (): void => {
      setIsApproving(true)

      patch.execute([
        {
          set: {
            'workflowMetadata.workflowStatus': 'approved' as WorkflowStatus,
            'workflowMetadata.approvedAt': new Date().toISOString(),
            'workflowMetadata.approvedBy':
              currentUser?.name || currentUser?.email || 'Unknown User',
          },
        },
      ])

      setIsApproving(false)
      props.onComplete()
    },
  }
}

// Reject Action (for reviewers)
export const RejectAction: DocumentActionComponent = (
  props: WorkflowActionProps,
): DocumentActionDescription | null => {
  const {patch} = useDocumentOperation(props.id, props.type)
  const [isRejecting, setIsRejecting] = useState<boolean>(false)
  const [reason, setReason] = useState<string>('')
  const [showDialog, setShowDialog] = useState<boolean>(false)

  // Only show for documents in review
  const canReject = props.draft?.workflowMetadata?.workflowStatus === 'in-review'

  if (!canReject) {
    return null
  }

  return {
    label: 'Reject',
    icon: () => '❌',
    disabled: isRejecting,
    tone: 'critical',
    onHandle: (): void => {
      setShowDialog(true)
    },
    dialog: showDialog
      ? {
          type: 'dialog' as const,
          header: 'Reject Document',
          onClose: () => {
            setShowDialog(false)
            setReason('')
          },
          content: (
            <div style={{padding: '16px'}}>
              <label htmlFor="reason">Reason for rejection:</label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                rows={4}
                style={{width: '100%', marginTop: '8px'}}
                placeholder="Please provide a reason for rejection..."
              />
              <div style={{marginTop: '16px', textAlign: 'right'}}>
                <button
                  onClick={() => {
                    setShowDialog(false)
                    setReason('')
                  }}
                  style={{marginRight: '8px'}}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsRejecting(true)

                    patch.execute([
                      {
                        set: {
                          'workflowMetadata.workflowStatus': 'rejected' as WorkflowStatus,
                          'workflowMetadata.rejectionReason': reason,
                        },
                      },
                    ])

                    setShowDialog(false)
                    setReason('')
                    setIsRejecting(false)
                    props.onComplete()
                  }}
                  disabled={!reason.trim()}
                  type="button"
                >
                  Reject
                </button>
              </div>
            </div>
          ) as React.ReactNode,
        }
      : undefined,
  }
}

// Reset to Draft Action (for rejected documents - allows author to resubmit)
export const ResetToDraftAction: DocumentActionComponent = (
  props: WorkflowActionProps,
): DocumentActionDescription | null => {
  const {patch} = useDocumentOperation(props.id, props.type)

  const canReset = props.draft?.workflowMetadata?.workflowStatus === 'rejected'

  if (!canReset) {
    return null
  }

  return {
    label: 'Reset to Draft',
    icon: () => '🔄',
    onHandle: (): void => {
      patch.execute([
        {
          set: {'workflowMetadata.workflowStatus': 'draft' as WorkflowStatus},
          unset: ['workflowMetadata.rejectionReason'],
        },
      ])

      props.onComplete()
    },
  }
}
