'use client'

import {useEffect, useState, useCallback} from 'react'
import Link from 'next/link'
import {ProductCard} from '@/components/MenuBoard/ProductCard'
import {CategoryNav} from '@/components/MenuBoard/CategoryNav'
import {RegionSelector} from '@/components/MenuBoard/RegionSelector'
import {catalogClient, contentClient} from '@/lib/sanity'
import {
  ALL_PRODUCTS_QUERY,
  ALL_MENU_ITEMS_QUERY,
  PRICING_BY_REGION_QUERY,
  ACTIVE_PROMOTIONS_QUERY,
} from '@/lib/queries'
import type {Product, MenuItem, ProductPricing, Promotion, EnrichedMenuItem} from '@/lib/types'

export default function MenuBoardPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeRegion, setActiveRegion] = useState('georgia')
  const [enrichedItems, setEnrichedItems] = useState<EnrichedMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [products, menuItems, pricing, promotions] = await Promise.all([
        catalogClient.fetch<Product[]>(ALL_PRODUCTS_QUERY),
        contentClient.fetch<MenuItem[]>(ALL_MENU_ITEMS_QUERY),
        catalogClient.fetch<ProductPricing[]>(PRICING_BY_REGION_QUERY, {region: activeRegion}),
        contentClient.fetch<Promotion[]>(ACTIVE_PROMOTIONS_QUERY),
      ])

      const productMap = new Map(products.map((p) => [p._id, p]))
      const pricingMap = new Map(pricing.map((p) => [p.productId, p]))
      const promotionsByMenuItem = new Map<string, Promotion[]>()

      promotions.forEach((promo) => {
        promo.menuItemRefs?.forEach((ref) => {
          if (!promotionsByMenuItem.has(ref)) promotionsByMenuItem.set(ref, [])
          promotionsByMenuItem.get(ref)!.push(promo)
        })
      })

      const enriched: EnrichedMenuItem[] = menuItems.map((item) => ({
        ...item,
        product: item.productRef ? productMap.get(item.productRef) : undefined,
        pricing: item.productRef ? pricingMap.get(item.productRef) : undefined,
        activePromotions: promotionsByMenuItem.get(item._id) || [],
      }))

      enriched.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
      })

      setEnrichedItems(enriched)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu')
    } finally {
      setLoading(false)
    }
  }, [activeRegion])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredItems =
    activeCategory === 'all'
      ? enrichedItems
      : enrichedItems.filter((item) => item.product?.category === activeCategory)

  const counts: Record<string, number> = {all: enrichedItems.length}
  enrichedItems.forEach((item) => {
    if (item.product?.category) {
      counts[item.product.category] = (counts[item.product.category] || 0) + 1
    }
  })

  const featuredItems = enrichedItems.filter((item) => item.featured)

  return (
    <div className="min-h-screen bg-bh-cream">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bh-dark/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍔</span>
            <span className="text-white font-display font-bold text-xl tracking-tight">
              Burger Haven
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#menu" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Menu
            </a>
            <a href="#featured" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
              Featured
            </a>
            <Link
              href="/admin"
              className="text-xs bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-4 py-2 rounded-full transition-all border border-white/10"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 bg-bh-dark overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage: 'radial-gradient(circle at 20% 50%, #C8102E 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D4A017 0%, transparent 40%)'}}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            <p className="text-bh-gold text-sm font-semibold tracking-widest uppercase mb-4">
              Fresh Made Daily
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-none mb-6">
              Boldly<br />
              <span className="text-bh-red-light">Crafted.</span>
            </h1>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Premium ingredients, signature recipes, and flavors built to satisfy.
              Every burger made fresh to order.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#menu"
                className="bg-bh-red hover:bg-bh-red-light text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-bh-red/30 hover:shadow-bh-red/50 hover:-translate-y-0.5"
              >
                View Full Menu
              </a>
              <RegionSelector activeRegion={activeRegion} onRegionChange={setActiveRegion} />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-bh-cream to-transparent" />
      </section>

      {/* Value Props Bar */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              {icon: '🥩', label: 'Never Frozen'},
              {icon: '🌿', label: 'Fresh Ingredients'},
              {icon: '👨‍🍳', label: 'Made to Order'},
            ].map(({icon, label}) => (
              <div key={label} className="flex items-center justify-center gap-2">
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-semibold text-bh-charcoal">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      {!loading && featuredItems.length > 0 && (
        <section id="featured" className="py-16 bg-bh-warm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-bh-red text-xs font-bold tracking-widest uppercase mb-2">Staff Picks</p>
                <h2 className="font-display text-4xl font-bold text-bh-dark">Fan Favorites</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredItems.slice(0, 3).map((item, i) => (
                <ProductCard key={item._id} item={item} region={activeRegion} featured={i === 0} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full Menu */}
      <section id="menu" className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-bh-red text-xs font-bold tracking-widest uppercase mb-2">Everything We Offer</p>
            <h2 className="font-display text-4xl font-bold text-bh-dark">Our Menu</h2>
          </div>

          <CategoryNav
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={counts}
          />

          {loading && (
            <div className="flex items-center justify-center py-32">
              <div className="text-center">
                <div className="text-5xl mb-4 animate-bounce">🍔</div>
                <p className="text-bh-gray font-medium">Preparing your menu...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
              <p className="text-red-600 font-semibold mb-1">Couldn't load menu</p>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center py-32">
              <div className="text-5xl mb-4">🤷</div>
              <p className="text-bh-gray font-medium">No items in this category yet.</p>
            </div>
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <ProductCard key={item._id} item={item} region={activeRegion} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bh-dark text-white mt-8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🍔</span>
                <span className="font-display font-bold text-xl">Burger Haven</span>
              </div>
              <p className="text-white/40 text-sm">Fresh Made Daily</p>
            </div>
            <div className="text-right">
              <p className="text-white/30 text-xs font-mono">
                productcatalog ↔ customercontent
              </p>
              <p className="text-white/20 text-xs mt-1">Powered by Sanity</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
