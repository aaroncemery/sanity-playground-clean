import Link from 'next/link'
import {DataFlowDiagram} from '@/components/Admin/DataFlowDiagram'
import {SyncStatusCard, RecentActivity} from '@/components/Admin/SyncStatusCard'
import {catalogClient, contentClient} from '@/lib/sanity'
import {CATALOG_STATS_QUERY, CONTENT_STATS_QUERY} from '@/lib/queries'
import type {CatalogStats, ContentStats} from '@/lib/types'

export const revalidate = 30

export default async function AdminDashboardPage() {
  const [catalogStats, contentStats] = await Promise.all([
    catalogClient.fetch<CatalogStats>(CATALOG_STATS_QUERY),
    contentClient.fetch<ContentStats>(CONTENT_STATS_QUERY),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-bh-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-bh-gold">🍔 Burger Haven</h1>
              <p className="text-gray-400 text-sm">Admin Dashboard — PIM Integration Demo</p>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                ← Menu Board
              </Link>
              <Link
                href="/admin/validation"
                className="bg-bh-red hover:bg-bh-red-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                ⚡ Validation Demo
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Data flow diagram */}
        <DataFlowDiagram />

        {/* Sync stats */}
        <SyncStatusCard catalogStats={catalogStats} contentStats={contentStats} />

        {/* Recent activity */}
        <RecentActivity catalogStats={catalogStats} contentStats={contentStats} />

        {/* Studio links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-400">
            <h3 className="font-bold text-gray-900 mb-1">📦 Product Catalog Workspace</h3>
            <p className="text-sm text-gray-600 mb-3">
              View and manage products synced from external PIM. Functions enforce validation on all
              writes.
            </p>
            <p className="text-xs font-mono text-gray-400">
              Studio: localhost:3340/catalog
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dataset: <span className="font-mono">productcatalog</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-purple-400">
            <h3 className="font-bold text-gray-900 mb-1">✨ Customer Content Workspace</h3>
            <p className="text-sm text-gray-600 mb-3">
              Manage menu items, promotions, and campaigns. Cross-dataset references link to product
              catalog.
            </p>
            <p className="text-xs font-mono text-gray-400">
              Studio: localhost:3340/content
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dataset: <span className="font-mono">customercontent</span>
            </p>
          </div>
        </div>

        {/* Key talking points */}
        <div className="mt-8 bg-bh-cream border border-bh-gold rounded-xl p-6">
          <h3 className="font-bold text-bh-dark text-lg mb-4">🎯 Demo Talking Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: '⚡',
                title: 'Functions enforce validation on ALL writes',
                desc: 'External PIM can\'t bypass business rules — API, Studio, webhooks all go through Functions',
              },
              {
                icon: '🔗',
                title: 'Cross-dataset references separate concerns',
                desc: 'PIM controls products/pricing; Marketing adds customer-facing content. Clean separation.',
              },
              {
                icon: '📊',
                title: 'Single query combines multiple sources',
                desc: 'Product catalog + pricing + marketing + promotions in one response. No complex joins.',
              },
              {
                icon: '📋',
                title: 'Complete audit trail of PIM activity',
                desc: 'Sync status tracking, validation logs, error tracking — full visibility into what PIM wrote.',
              },
            ].map((point) => (
              <div key={point.title} className="flex gap-3">
                <span className="text-2xl">{point.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-bh-dark">{point.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{point.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
