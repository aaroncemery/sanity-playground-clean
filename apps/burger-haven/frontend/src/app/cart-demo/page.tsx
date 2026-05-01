'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import Link from 'next/link'
import {catalogClient, contentClient} from '@/lib/sanity'
import {
  ALL_MENU_ITEMS_QUERY,
  ALL_PRODUCTS_QUERY,
  ACTIVE_OFFER_RULES_QUERY,
  EMBEDDINGS_RECOMMENDATIONS_QUERY,
} from '@/lib/queries'
import type {
  CartLine,
  Channel,
  EnrichedMenuItem,
  EmbeddingsRecommendation,
  MenuItem,
  OfferRule,
  Product,
} from '@/lib/types'
import {buildCartContext, currentDaypart, evaluateNudge} from '@/lib/upsell'
import {CartItemPicker} from '@/components/CartDemo/CartItemPicker'
import {BagScreen} from '@/components/CartDemo/BagScreen'
import {SuggestedProducts} from '@/components/CartDemo/SuggestedProducts'
import {
  CdnLatencyPanel,
  type FetchMetric,
} from '@/components/CartDemo/CdnLatencyPanel'
import {EmbeddingsPlayground} from '@/components/CartDemo/EmbeddingsPlayground'

const CHANNELS: Channel[] = ['mobile', 'web', 'kiosk']

export default function CartDemoPage() {
  const [menuItems, setMenuItems] = useState<EnrichedMenuItem[]>([])
  const [rules, setRules] = useState<OfferRule[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [channel, setChannel] = useState<Channel>('mobile')
  const [variantId, setVariantId] = useState<string>('A')
  const [cartMargin, setCartMargin] = useState(35)
  const [metrics, setMetrics] = useState<FetchMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [embeddingsResults, setEmbeddingsResults] = useState<
    EmbeddingsRecommendation[]
  >([])
  const [embeddingsError, setEmbeddingsError] = useState<string | null>(null)
  const [embeddingsLoading, setEmbeddingsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const daypart = useMemo(() => currentDaypart(), [])

  const recordMetric = useCallback((m: FetchMetric) => {
    setMetrics((prev) => [...prev, m].slice(-20))
  }, [])

  const loadRules = useCallback(async () => {
    const start = performance.now()
    try {
      const data = await contentClient.fetch<OfferRule[]>(ACTIVE_OFFER_RULES_QUERY, {
        channel,
        daypart,
      })
      const duration = performance.now() - start
      setRules(data)
      recordMetric({
        label: 'offerRules',
        durationMs: duration,
        payloadBytes: JSON.stringify(data).length,
        itemCount: data.length,
        cacheStatus: duration < 50 ? 'HIT' : 'MISS',
        timestamp: Date.now(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offer rules')
    }
  }, [channel, daypart, recordMetric])

  const loadMenu = useCallback(async () => {
    try {
      const [items, products] = await Promise.all([
        contentClient.fetch<MenuItem[]>(ALL_MENU_ITEMS_QUERY),
        catalogClient.fetch<Product[]>(ALL_PRODUCTS_QUERY),
      ])
      const productMap = new Map(products.map((p) => [p._id, p]))
      const enriched: EnrichedMenuItem[] = items.map((it) => ({
        ...it,
        product: it.productRef ? productMap.get(it.productRef) : undefined,
      }))
      setMenuItems(enriched)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu')
    }
  }, [])

  useEffect(() => {
    let mounted = true
    Promise.all([loadMenu(), loadRules()]).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [loadMenu, loadRules])

  // Recompute embeddings recommendations when cart changes
  useEffect(() => {
    if (cart.length === 0) {
      setEmbeddingsResults([])
      setEmbeddingsError(null)
      return
    }

    const cartContext = buildCartContext(cart)
    setEmbeddingsLoading(true)
    const start = performance.now()
    contentClient
      .fetch<EmbeddingsRecommendation[]>(EMBEDDINGS_RECOMMENDATIONS_QUERY, {cartContext})
      .then((data) => {
        const filtered = data.filter(
          (d) => !cart.some((c) => c.menuItemId === d._id),
        )
        setEmbeddingsResults(filtered)
        setEmbeddingsError(null)
        recordMetric({
          label: 'embeddings',
          durationMs: performance.now() - start,
          payloadBytes: JSON.stringify(data).length,
          itemCount: data.length,
          timestamp: Date.now(),
        })
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setEmbeddingsError(
          msg.includes('semantic') || msg.includes('embeddings')
            ? 'Dataset Embeddings not enabled (Growth+ feature)'
            : msg,
        )
        setEmbeddingsResults([])
      })
      .finally(() => setEmbeddingsLoading(false))
  }, [cart, recordMetric])

  const nudge = useMemo(
    () => evaluateNudge({cart, rules, variantId, cartMargin}),
    [cart, rules, variantId, cartMargin],
  )

  const allVariants = useMemo(() => {
    const ids = new Set<string>()
    rules.forEach((r) => r.copyVariants.forEach((v) => ids.add(v.variantId)))
    return Array.from(ids).sort()
  }, [rules])

  const addLine = useCallback((line: CartLine) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItemId === line.menuItemId)
      if (existing) {
        return prev.map((l) =>
          l.menuItemId === line.menuItemId ? {...l, qty: l.qty + 1} : l,
        )
      }
      return [...prev, line]
    })
  }, [])

  const incrementLine = useCallback((id: string) => {
    setCart((prev) =>
      prev.map((l) => (l.menuItemId === id ? {...l, qty: l.qty + 1} : l)),
    )
  }, [])

  const decrementLine = useCallback((id: string) => {
    setCart((prev) =>
      prev
        .map((l) => (l.menuItemId === id ? {...l, qty: l.qty - 1} : l))
        .filter((l) => l.qty > 0),
    )
  }, [])

  const removeLine = useCallback((id: string) => {
    setCart((prev) => prev.filter((l) => l.menuItemId !== id))
  }, [])

  return (
    <div className="min-h-screen bg-bh-cream">
      {/* Top bar */}
      <header className="bg-bh-dark text-white">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              ← Burger Haven
            </Link>
            <span className="text-white/30">/</span>
            <h1 className="font-display text-lg font-bold">JitB Upsell Demo</h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/admin"
              className="bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-3 py-1.5 rounded-full transition-all"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-bh-dark to-bh-charcoal text-white">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-bh-gold text-xs font-bold tracking-widest uppercase mb-2">
            Sales POC · Replacing Braze AI
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-3">
            Marketers control the rules. <br className="hidden md:block" />
            Sanity&apos;s CDN delivers them.
          </h2>
          <p className="text-white/60 max-w-2xl text-sm leading-relaxed">
            Add items to the simulated bag below to see real-time upsell nudges, tier
            progression, and embeddings-powered product recommendations — all driven by
            content edited in Sanity Studio.
          </p>
        </div>
      </section>

      {/* Controls */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-2xl bg-white border border-gray-200 p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Control label="Channel">
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as Channel)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-bh-red focus:outline-none focus:ring-2 focus:ring-bh-red/20"
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Control>
          <Control label="Daypart (auto)">
            <input
              value={daypart}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-bh-gray"
            />
          </Control>
          <Control label="Copy variant">
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-bh-red focus:outline-none focus:ring-2 focus:ring-bh-red/20"
            >
              {(allVariants.length ? allVariants : ['A']).map((id) => (
                <option key={id} value={id}>
                  Variant {id}
                </option>
              ))}
            </select>
          </Control>
          <Control label={`Cart margin (${cartMargin}%)`}>
            <input
              type="range"
              min={0}
              max={60}
              value={cartMargin}
              onChange={(e) => setCartMargin(Number(e.target.value))}
              className="w-full accent-bh-red"
            />
          </Control>
        </div>
      </section>

      {error && (
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Main split */}
      <section className="max-w-7xl mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: bag */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-bh-gray">
            Mobile App · Bag Screen
          </h3>
          <BagScreen
            cart={cart}
            nudge={nudge}
            onIncrement={incrementLine}
            onDecrement={decrementLine}
            onRemove={removeLine}
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-bh-dark mb-3">
              Add menu items
            </h4>
            {loading ? (
              <p className="text-sm text-bh-gray italic">Loading menu…</p>
            ) : (
              <CartItemPicker items={menuItems} onAdd={addLine} />
            )}
          </div>
        </div>

        {/* Right: rule + recs */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-bh-gray">
            Live rule evaluation
          </h3>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-display font-bold text-bh-dark text-base">
                  Active rule
                </h4>
                <p className="text-xs text-bh-gray">
                  Filtered by channel, daypart, schedule, kill switch
                </p>
              </div>
              <span className="text-xs font-mono bg-gray-100 text-bh-dark px-2 py-1 rounded">
                {rules.length} active
              </span>
            </div>

            {rules.length === 0 ? (
              <div className="text-sm text-bh-gray italic py-4 text-center bg-gray-50 rounded-xl">
                No active rules for {channel}/{daypart}. Create one in Studio under
                Customer Content.
              </div>
            ) : (
              <ul className="space-y-2">
                {rules.map((r) => (
                  <li
                    key={r._id}
                    className="flex items-center justify-between gap-2 text-xs px-3 py-2 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <span className="font-bold text-bh-dark">{r.name}</span>
                    <span className="font-mono text-bh-gray">
                      {r.tiers.length} tiers · pri {r.priority ?? '—'}
                      {typeof r.marginFloor === 'number' ? ` · margin ≥${r.marginFloor}%` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <SuggestedProducts
              manual={nudge?.rule.suggestedProducts ?? []}
              semantic={embeddingsResults}
              onAdd={addLine}
              loading={embeddingsLoading}
              embeddingsError={embeddingsError}
            />
          </div>

          <CdnLatencyPanel metrics={metrics} />
        </div>
      </section>

      {/* Embeddings playground */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <EmbeddingsPlayground />
      </section>
    </div>
  )
}

function Control({label, children}: {label: string; children: React.ReactNode}) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest font-bold text-bh-gray mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}
