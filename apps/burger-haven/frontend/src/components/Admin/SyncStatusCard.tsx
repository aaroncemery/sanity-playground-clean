import {CatalogStats, ContentStats} from '@/lib/types'

interface SyncStatusCardProps {
  catalogStats: CatalogStats
  contentStats: ContentStats
}

export function SyncStatusCard({catalogStats, contentStats}: SyncStatusCardProps) {
  const syncHealth =
    catalogStats.failedProducts === 0
      ? {label: '✅ Healthy', color: 'text-green-600 bg-green-50', border: 'border-green-200'}
      : {
          label: `⚠️ ${catalogStats.failedProducts} Failed`,
          color: 'text-red-600 bg-red-50',
          border: 'border-red-200',
        }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Products */}
      <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products in Catalog</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{catalogStats.totalProducts}</p>
        <p className="text-xs text-gray-500 mt-1">
          {catalogStats.syncedProducts} synced • {catalogStats.failedProducts} failed
        </p>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-400">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Menu Items</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{contentStats.totalMenuItems}</p>
        <p className="text-xs text-gray-500 mt-1">{contentStats.featuredItems} featured</p>
      </div>

      {/* Active Promotions */}
      <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-400">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Promotions</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{contentStats.activePromotions}</p>
        <p className="text-xs text-gray-500 mt-1">{contentStats.totalCampaigns} campaigns total</p>
      </div>

      {/* Sync Health */}
      <div className={`bg-white rounded-xl shadow p-4 border-l-4 ${syncHealth.border}`}>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sync Health</p>
        <p className={`text-xl font-bold mt-1 ${syncHealth.color.split(' ')[0]}`}>
          {syncHealth.label}
        </p>
        <p className="text-xs text-gray-500 mt-1">{catalogStats.totalLocations} locations</p>
      </div>
    </div>
  )
}

interface RecentActivityProps {
  catalogStats: CatalogStats
  contentStats: ContentStats
}

export function RecentActivity({catalogStats, contentStats}: RecentActivityProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Recent PIM Syncs */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-bold text-gray-900 mb-4">📦 Recent PIM Syncs</h3>
        {catalogStats.recentProducts.length === 0 ? (
          <p className="text-sm text-gray-400">No recent syncs</p>
        ) : (
          <div className="space-y-2">
            {catalogStats.recentProducts.map((product) => (
              <div
                key={product._id}
                className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">{product.sku}</span>
                  <span className="text-sm text-gray-500 ml-2">{product.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {product.syncSource && (
                    <span className="text-xs text-gray-400">{product.syncSource}</span>
                  )}
                  <span className="text-sm">
                    {product.syncStatus === 'synced'
                      ? '✅'
                      : product.syncStatus === 'validation_failed'
                        ? '⚠️'
                        : product.syncStatus === 'error'
                          ? '❌'
                          : '⏳'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Validation failures */}
        {catalogStats.failedValidations.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-700 mb-2">
              ⚠️ Validation Failures ({catalogStats.failedValidations.length})
            </p>
            {catalogStats.failedValidations.slice(0, 3).map((failure) => (
              <div key={failure._id} className="text-xs text-red-600 mb-1">
                <span className="font-medium">{failure.sku}</span> — {failure.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Content Updates */}
      <div className="bg-white rounded-xl shadow p-5">
        <h3 className="font-bold text-gray-900 mb-4">✨ Recent Content Updates</h3>
        {contentStats.recentMenuItems.length === 0 ? (
          <p className="text-sm text-gray-400">No recent updates</p>
        ) : (
          <div className="space-y-2">
            {contentStats.recentMenuItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
              >
                <span className="text-sm font-medium text-gray-900">
                  {item.featured ? '⭐ ' : ''}{item.marketingName}
                </span>
                {item._updatedAt && (
                  <span className="text-xs text-gray-400">
                    {new Date(item._updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
