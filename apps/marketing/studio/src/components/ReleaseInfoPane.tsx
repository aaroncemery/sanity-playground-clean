// DEMO: S.document().defaultPanes() — custom view panel alongside the editor
import React from 'react'
import type {SanityDocument} from 'sanity'

interface Feature {
  title?: string
  badge?: string
  docsUrl?: string
}

interface ChangelogDocument extends SanityDocument {
  title?: string
  slug?: {current?: string}
  releaseMonth?: string
  summary?: string
  features?: Feature[]
}

interface ReleaseInfoPaneProps {
  document: {
    displayed: ChangelogDocument
    draft: ChangelogDocument | null
    published: ChangelogDocument | null
  }
}

const BADGE_COLORS: Record<string, {bg: string; color: string}> = {
  new: {bg: '#d1fae5', color: '#065f46'},
  improved: {bg: '#fef3c7', color: '#92400e'},
  studio: {bg: '#dbeafe', color: '#1e40af'},
  api: {bg: '#ede9fe', color: '#5b21b6'},
  developer: {bg: '#ffedd5', color: '#9a3412'},
}

export function ReleaseInfoPane({document: {displayed}}: ReleaseInfoPaneProps) {
  const doc = displayed
  const features = doc.features || []
  const slug = doc.slug?.current || ''

  // Count badges
  const badgeCounts = features.reduce<Record<string, number>>((acc, f) => {
    if (f.badge) {
      acc[f.badge] = (acc[f.badge] || 0) + 1
    }
    return acc
  }, {})

  const releaseDate = doc.releaseMonth
    ? new Date(doc.releaseMonth).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
    : '—'

  return (
    <div style={{padding: '24px', fontFamily: 'system-ui, sans-serif'}}>
      <h3 style={{margin: '0 0 16px', fontSize: '18px', fontWeight: 600}}>Release Info</h3>

      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <div style={{marginBottom: '8px'}}>
          <span style={{fontWeight: 500, color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
            Release Date
          </span>
          <div style={{marginTop: '4px', fontSize: '16px', fontWeight: 600}}>{releaseDate}</div>
        </div>
        <div style={{marginTop: '12px'}}>
          <span style={{fontWeight: 500, color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
            URL Slug
          </span>
          <div
            style={{
              marginTop: '4px',
              fontFamily: 'monospace',
              fontSize: '13px',
              background: '#e2e8f0',
              padding: '4px 8px',
              borderRadius: '4px',
              wordBreak: 'break-all',
            }}
          >
            {slug || '— not set —'}
          </div>
        </div>
      </div>

      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
        }}
      >
        <span style={{fontWeight: 500, color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
          Feature Count
        </span>
        <div style={{marginTop: '8px', fontSize: '28px', fontWeight: 700, color: '#0f172a'}}>
          {features.length}
        </div>
      </div>

      {Object.keys(badgeCounts).length > 0 && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <span style={{fontWeight: 500, color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
            Badge Breakdown
          </span>
          <div style={{marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
            {Object.entries(badgeCounts).map(([badge, count]) => {
              const colors = BADGE_COLORS[badge] || {bg: '#f1f5f9', color: '#475569'}
              return (
                <span
                  key={badge}
                  style={{
                    background: colors.bg,
                    color: colors.color,
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    fontWeight: 500,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {badge} <strong style={{fontWeight: 700}}>×{count}</strong>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {features.length === 0 && (
        <div style={{color: '#94a3b8', fontSize: '14px', fontStyle: 'italic'}}>
          No features added yet. Use the editor to add features to this release.
        </div>
      )}
    </div>
  )
}
