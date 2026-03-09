// DEMO: App SDK running inside Studio with zero external config
// This plugin uses the Sanity App SDK hooks (useClient, etc.) to build a live
// document count dashboard directly inside Studio — no separate app needed.

import React, {useEffect, useState} from 'react'
import {definePlugin, useClient} from 'sanity'

interface DocCount {
  type: string
  label: string
  count: number
  emoji: string
}

const TYPE_CONFIG: {type: string; label: string; emoji: string}[] = [
  {type: 'blog', label: 'Blog Posts', emoji: '📝'},
  {type: 'changelog', label: 'Platform Updates', emoji: '📋'},
  {type: 'page', label: 'Pages', emoji: '📄'},
  {type: 'product', label: 'Products', emoji: '🛍️'},
  {type: 'redirect', label: 'Redirects', emoji: '↪️'},
]

function ContentDashboard() {
  const client = useClient({apiVersion: '2024-01-01'})
  const [counts, setCounts] = useState<DocCount[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchCounts = () => {
    setLoading(true)
    const queries = TYPE_CONFIG.map(({type}) =>
      client.fetch<number>(`count(*[_type == $type && !(_id in path("drafts.**"))])`, {type}),
    )

    Promise.all(queries)
      .then((results) => {
        setCounts(
          TYPE_CONFIG.map(({type, label, emoji}, i) => ({
            type,
            label,
            emoji,
            count: results[i] || 0,
          })),
        )
        setLastUpdated(new Date())
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchCounts()
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30_000)
    return () => clearInterval(interval)
  }, [client]) // eslint-disable-line react-hooks/exhaustive-deps

  const total = counts.reduce((sum, c) => sum + c.count, 0)

  return (
    <div
      style={{
        padding: '32px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <div style={{marginBottom: '32px'}}>
        <h1 style={{fontSize: '28px', fontWeight: 700, margin: '0 0 8px'}}>
          Content Dashboard
        </h1>
        <p style={{color: '#64748b', margin: 0, fontSize: '14px'}}>
          Live document counts for the production dataset
          {lastUpdated && (
            <span>
              {' '}
              · Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      {loading && !counts.length ? (
        <div style={{color: '#94a3b8', fontSize: '14px'}}>Loading content counts…</div>
      ) : (
        <>
          {/* Total count card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              color: 'white',
            }}
          >
            <div style={{fontSize: '14px', opacity: 0.85, marginBottom: '8px', fontWeight: 500}}>
              Total Published Documents
            </div>
            <div style={{fontSize: '48px', fontWeight: 700, lineHeight: 1}}>{total}</div>
          </div>

          {/* Per-type cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            {counts.map(({type, label, emoji, count}) => (
              <div
                key={type}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{fontSize: '24px'}}>{emoji}</div>
                <div style={{fontSize: '32px', fontWeight: 700, color: '#0f172a', lineHeight: 1}}>
                  {count}
                </div>
                <div style={{fontSize: '13px', color: '#64748b', fontWeight: 500}}>{label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={fetchCounts}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Refreshing…' : 'Refresh counts'}
          </button>
        </>
      )}

      <div
        style={{
          marginTop: '32px',
          padding: '12px 16px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#15803d',
        }}
      >
        <strong>DEMO:</strong> App SDK running inside Studio with zero external config — this
        dashboard uses <code>useClient()</code> from Sanity's App SDK to run live GROQ queries
        without any external setup.
      </div>
    </div>
  )
}

// DEMO: App SDK running inside Studio with zero external config
export const contentDashboardPlugin = definePlugin({
  name: 'content-dashboard',
  tools: [
    {
      name: 'content-dashboard',
      title: 'Dashboard',
      icon: () => '📊',
      component: ContentDashboard,
    },
  ],
})
