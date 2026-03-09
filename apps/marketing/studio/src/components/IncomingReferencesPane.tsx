// DEMO: incoming references view — shows all documents that reference the current document
import React, {useEffect, useState} from 'react'
import {useClient} from 'sanity'
import type {SanityDocument} from 'sanity'

interface IncomingReferencesPaneProps {
  document: {
    displayed: SanityDocument
    draft: SanityDocument | null
    published: SanityDocument | null
  }
}

interface RefDoc {
  _id: string
  _type: string
  title?: string
  slug?: {current?: string}
}

const TYPE_LABELS: Record<string, string> = {
  blog: '📝 Blog Post',
  page: '📄 Page',
  product: '🛍 Product',
  changelog: '📋 Changelog',
  navigation: '📱 Navigation',
  home: '🏠 Homepage',
}

export function IncomingReferencesPane({document: {displayed}}: IncomingReferencesPaneProps) {
  const client = useClient({apiVersion: '2024-01-01'})
  const [refs, setRefs] = useState<RefDoc[]>([])
  const [loading, setLoading] = useState(true)

  const docId = displayed._id?.replace(/^drafts\./, '')

  useEffect(() => {
    if (!docId) return
    setLoading(true)
    client
      .fetch<RefDoc[]>(
        `*[references($id)]{_id, _type, title, slug}[0...50]`,
        {id: docId},
      )
      .then((results) => {
        setRefs(results || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [client, docId])

  return (
    <div style={{padding: '24px', fontFamily: 'system-ui, sans-serif'}}>
      <h3 style={{margin: '0 0 4px', fontSize: '18px', fontWeight: 600}}>Incoming References</h3>
      <div style={{color: '#64748b', fontSize: '14px', marginBottom: '20px'}}>
        Documents that link to this one
      </div>

      {loading && (
        <div style={{color: '#94a3b8', fontSize: '14px'}}>Loading references…</div>
      )}

      {!loading && refs.length === 0 && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '14px',
          }}
        >
          No documents reference this one yet.
        </div>
      )}

      {!loading && refs.length > 0 && (
        <div>
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              color: '#1e40af',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {refs.length} document{refs.length !== 1 ? 's' : ''} reference this content
          </div>
          <div>
            {refs.map((ref) => (
              <div
                key={ref._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div>
                  <div style={{fontSize: '14px', fontWeight: 500}}>
                    {ref.title || ref._id}
                  </div>
                  <div style={{fontSize: '12px', color: '#64748b', marginTop: '2px'}}>
                    {TYPE_LABELS[ref._type] || ref._type}
                    {ref.slug?.current && ` · /${ref.slug.current}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
