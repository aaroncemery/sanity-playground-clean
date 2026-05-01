'use client'

import Image from 'next/image'
import {urlForContentImage} from '@/lib/sanity'
import type {
  CartLine,
  EmbeddingsRecommendation,
  OfferRuleSuggestedProduct,
} from '@/lib/types'

interface Props {
  manual: OfferRuleSuggestedProduct[]
  semantic: EmbeddingsRecommendation[]
  onAdd: (line: CartLine) => void
  loading?: boolean
  embeddingsError?: string | null
}

export function SuggestedProducts({
  manual,
  semantic,
  onAdd,
  loading,
  embeddingsError,
}: Props) {
  return (
    <div className="space-y-5">
      {/* Manual suggestions from the rule */}
      {manual.length > 0 && (
        <section>
          <SectionHeader
            label="From the rule"
            hint="Marketer-curated suggestions on this offer"
          />
          <ProductRow products={manual.map(toCard)} onAdd={onAdd} />
        </section>
      )}

      {/* Embeddings-powered */}
      <section>
        <SectionHeader
          label="Recommended for you"
          hint="Semantic similarity via Sanity Dataset Embeddings"
        />
        {embeddingsError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-semibold mb-1">Embeddings unavailable</p>
            <p className="text-amber-800">
              {embeddingsError}. Using manual suggestions instead.
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-3 gap-2 animate-pulse">
            {Array.from({length: 3}).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-gray-100" />
            ))}
          </div>
        ) : semantic.length === 0 ? (
          <p className="text-xs text-bh-gray italic">
            No semantic matches yet — add items to your cart.
          </p>
        ) : (
          <ProductRow
            products={semantic.map((s) => ({
              _id: s._id,
              marketingName: s.marketingName,
              tagline: s.tagline,
              heroImage: s.heroImage,
              badges: s.badges,
              score: s._score,
            }))}
            onAdd={onAdd}
          />
        )}
      </section>
    </div>
  )
}

function SectionHeader({label, hint}: {label: string; hint: string}) {
  return (
    <div className="mb-2">
      <h3 className="text-xs font-bold uppercase tracking-widest text-bh-dark">
        {label}
      </h3>
      <p className="text-[10px] text-bh-gray/70">{hint}</p>
    </div>
  )
}

interface CardData {
  _id: string
  marketingName: string
  tagline?: string
  heroImage?: OfferRuleSuggestedProduct['heroImage']
  badges?: string[]
  score?: number
}

function ProductRow({
  products,
  onAdd,
}: {
  products: CardData[]
  onAdd: (line: CartLine) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {products.map((p) => {
        const url = p.heroImage
          ? urlForContentImage(p.heroImage).width(200).height(200).fit('crop').url()
          : null
        const price = simulatedPrice(p._id)
        return (
          <button
            key={p._id}
            onClick={() =>
              onAdd({
                menuItemId: p._id,
                marketingName: p.marketingName,
                unitPrice: price,
                qty: 1,
                heroImage: p.heroImage,
              })
            }
            className="group flex flex-col items-stretch p-2 rounded-xl border border-gray-200 bg-white hover:border-bh-red hover:shadow-md transition-all text-left"
          >
            <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gradient-to-br from-stone-200 to-stone-300 mb-1.5">
              {url ? (
                <Image
                  src={url}
                  alt={p.marketingName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  🍽️
                </div>
              )}
              {typeof p.score === 'number' && (
                <span className="absolute top-1 right-1 text-[9px] font-mono bg-black/70 text-white px-1.5 py-0.5 rounded">
                  {p.score.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-[11px] font-bold text-bh-dark leading-tight truncate">
              {p.marketingName}
            </p>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] text-bh-red font-semibold">
                ${price.toFixed(2)}
              </span>
              <span className="text-[10px] text-bh-gray group-hover:text-bh-red">
                + Add
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function toCard(p: OfferRuleSuggestedProduct): CardData {
  return {
    _id: p._id,
    marketingName: p.marketingName,
    tagline: p.tagline,
    heroImage: p.heroImage,
    badges: p.badges,
  }
}

function simulatedPrice(id: string): number {
  const seed = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const cents = (seed % 600) + 199
  return cents / 100
}
