import Link from 'next/link'
import {DataFlowDiagram} from '@/components/Admin/DataFlowDiagram'
import {SyncStatusCard, RecentActivity} from '@/components/Admin/SyncStatusCard'
import {catalogClient, contentClient} from '@/lib/sanity'
import {CATALOG_STATS_QUERY, CONTENT_STATS_QUERY, ALL_MENU_ITEMS_QUERY, ALL_PRODUCTS_QUERY} from '@/lib/queries'
import {resolveMenuItemsWithProducts} from '@/lib/resolveMenuItems'
import type {CatalogProduct} from '@/lib/types/menuItem'
import type {CatalogStats, ContentStats} from '@/lib/types'

export const revalidate = 30

export default async function AdminDashboardPage() {
  const [catalogStats, contentStats, menuItemsRaw, products] = await Promise.all([
    catalogClient.fetch<CatalogStats>(CATALOG_STATS_QUERY),
    contentClient.fetch<ContentStats>(CONTENT_STATS_QUERY),
    contentClient.fetch<Array<{_id: string; marketingName: string; productRef?: string; [key: string]: unknown}>>(ALL_MENU_ITEMS_QUERY),
    catalogClient.fetch<CatalogProduct[]>(ALL_PRODUCTS_QUERY),
  ])

  // DEMO: cross-dataset join — two fetches merged at the application layer
  // typegen can't resolve crossDatasetReference fields automatically (see lib/types/menuItem.ts)
  const resolvedMenuItems = resolveMenuItemsWithProducts(menuItemsRaw, products)

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
              <Link
                href="/admin/sync-demo"
                className="bg-bh-gold hover:bg-yellow-500 text-bh-dark px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 Sync Demo
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

        {/* Cross-dataset resolved menu items */}
        <div className="mt-8 bg-white rounded-xl shadow p-5">
          <h3 className="font-bold text-gray-900 mb-1">🔗 Menu Items — Resolved Cross-Dataset</h3>
          <p className="text-sm text-gray-500 mb-4">
            Two fetches (customercontent + productcatalog) merged at the application layer.
            Typegen cannot resolve <code className="bg-gray-100 px-1 rounded">crossDatasetReference</code> fields automatically — see{' '}
            <code className="bg-gray-100 px-1 rounded">src/lib/types/menuItem.ts</code>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Marketing Name</th>
                  <th className="pb-2 pr-4 font-medium">SKU</th>
                  <th className="pb-2 pr-4 font-medium">Catalog Name</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {resolvedMenuItems.map((item) => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {item.marketingName}
                    </td>
                    <td className="py-2 pr-4 font-mono text-gray-600">
                      {item.product?.sku ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">
                      {item.product?.name ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="py-2">
                      {item.product ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          resolved
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          no ref
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
                desc: "External PIM can't bypass business rules — API, Studio, webhooks all go through Functions",
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
