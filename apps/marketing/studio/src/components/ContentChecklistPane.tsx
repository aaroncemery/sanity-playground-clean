// DEMO: S.document().defaultPanes() — Content Checklist pane alongside the blog editor
import React from 'react'
import type {SanityDocument} from 'sanity'

interface BlogDocument extends SanityDocument {
  title?: string
  description?: string
  slug?: {current?: string}
  image?: unknown
  content?: unknown[]
  seo?: {
    title?: string
    description?: string
    noIndex?: boolean
  }
  publishedAt?: string
}

interface ContentChecklistPaneProps {
  document: {
    displayed: BlogDocument
    draft: BlogDocument | null
    published: BlogDocument | null
  }
}

interface CheckItem {
  label: string
  pass: boolean
  detail?: string
}

function CheckRow({item}: {item: CheckItem}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '10px 0',
        borderBottom: '1px solid #f1f5f9',
      }}
    >
      <span
        style={{
          fontSize: '16px',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        {item.pass ? '✅' : '⚠️'}
      </span>
      <div>
        <div style={{fontSize: '14px', fontWeight: item.pass ? 400 : 500}}>{item.label}</div>
        {item.detail && (
          <div style={{fontSize: '12px', color: '#64748b', marginTop: '2px'}}>{item.detail}</div>
        )}
      </div>
    </div>
  )
}

export function ContentChecklistPane({document: {displayed}}: ContentChecklistPaneProps) {
  const doc = displayed
  const titleLength = doc.title?.length || 0
  const descLength = doc.description?.length || 0
  const hasContent = Array.isArray(doc.content) && doc.content.length > 0
  const hasImage = !!doc.image
  const hasSlug = !!doc.slug?.current
  const hasSeoTitle = !!doc.seo?.title
  const hasSeoDesc = !!doc.seo?.description
  const isPublished = !!doc.publishedAt

  const checks: CheckItem[] = [
    {
      label: 'Title length (10–100 chars)',
      pass: titleLength >= 10 && titleLength <= 100,
      detail: titleLength ? `${titleLength} characters` : 'No title yet',
    },
    {
      label: 'Description (140–160 chars)',
      pass: descLength >= 140 && descLength <= 160,
      detail: descLength ? `${descLength} characters` : 'No description yet',
    },
    {
      label: 'Main image set',
      pass: hasImage,
      detail: hasImage ? 'Image attached' : 'No image — required for social sharing',
    },
    {
      label: 'Content body added',
      pass: hasContent,
      detail: hasContent
        ? `${(doc.content as unknown[]).length} block(s)`
        : 'No content blocks yet',
    },
    {
      label: 'URL slug generated',
      pass: hasSlug,
      detail: hasSlug ? doc.slug?.current : 'Auto-generate from title',
    },
    {
      label: 'SEO title override',
      pass: hasSeoTitle,
      detail: hasSeoTitle ? doc.seo?.title : 'Falls back to post title (optional)',
    },
    {
      label: 'SEO description override',
      pass: hasSeoDesc,
      detail: hasSeoDesc ? `${doc.seo?.description?.length || 0} chars` : 'Falls back to description (optional)',
    },
    {
      label: 'Publish date set',
      pass: isPublished,
      detail: isPublished
        ? new Date(doc.publishedAt!).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'Not scheduled',
    },
  ]

  const passing = checks.filter((c) => c.pass).length
  const score = Math.round((passing / checks.length) * 100)

  return (
    <div style={{padding: '24px', fontFamily: 'system-ui, sans-serif'}}>
      <h3 style={{margin: '0 0 4px', fontSize: '18px', fontWeight: 600}}>Content Checklist</h3>
      <div style={{color: '#64748b', fontSize: '14px', marginBottom: '20px'}}>
        {passing}/{checks.length} checks passing
      </div>

      {/* Score bar */}
      <div
        style={{
          background: '#e2e8f0',
          borderRadius: '9999px',
          height: '8px',
          marginBottom: '24px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444',
            width: `${score}%`,
            height: '100%',
            borderRadius: '9999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <div>
        {checks.map((item, i) => (
          <CheckRow key={i} item={item} />
        ))}
      </div>
    </div>
  )
}
