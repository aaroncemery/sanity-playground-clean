'use client'

import Image from 'next/image'
import {urlForContentImage} from '@/lib/sanity'
import {cartSubtotal} from '@/lib/upsell'
import type {CartLine, ResolvedNudge} from '@/lib/types'

interface Props {
  cart: CartLine[]
  nudge: ResolvedNudge | null
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onRemove: (id: string) => void
}

export function BagScreen({cart, nudge, onIncrement, onDecrement, onRemove}: Props) {
  const subtotal = cartSubtotal(cart)
  const target = nudge?.tier.target ?? 0
  const progressPct = target > 0 ? Math.min(100, (subtotal / target) * 100) : 0

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-w-[420px] w-full mx-auto">
      {/* App-style header */}
      <div className="bg-bh-dark text-white px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-bh-gold">Burger Haven</p>
          <h2 className="font-display text-xl font-bold">Your Bag</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase text-white/50 tracking-widest">Items</p>
          <p className="font-bold">{cart.reduce((n, l) => n + l.qty, 0)}</p>
        </div>
      </div>

      {/* Nudge */}
      <div className="px-5 pt-4">
        {nudge ? (
          <div
            key={`${nudge.tier.lowerBound}-${nudge.unlocked ? 'won' : 'open'}`}
            className={`rounded-2xl p-4 transition-all duration-300 animate-[fadeIn_0.3s_ease-out] ${
              nudge.unlocked
                ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200'
                : 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={`font-display font-bold text-base leading-tight ${
                  nudge.unlocked ? 'text-emerald-800' : 'text-amber-900'
                }`}
              >
                {nudge.headline}
              </h3>
              <span className="text-[9px] uppercase tracking-widest font-bold text-bh-gray bg-white/70 px-2 py-0.5 rounded-full whitespace-nowrap">
                Variant {nudge.variant.variantId}
              </span>
            </div>
            {nudge.body && (
              <p
                className={`text-xs leading-relaxed mb-3 ${
                  nudge.unlocked ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {nudge.body}
              </p>
            )}

            {/* Progress bar */}
            {!nudge.unlocked && target > 0 && (
              <div className="mb-3">
                <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-bh-gold to-bh-red transition-all duration-500"
                    style={{width: `${progressPct}%`}}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-mono text-amber-800/70">
                  <span>${subtotal.toFixed(2)}</span>
                  <span>${target.toFixed(2)}</span>
                </div>
              </div>
            )}

            {nudge.cta && (
              <button
                className={`w-full py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  nudge.unlocked
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-bh-red hover:bg-bh-red-dark text-white'
                }`}
              >
                {nudge.cta}
              </button>
            )}

            <p className="mt-2 text-[9px] text-bh-gray/70 text-center font-mono">
              rule: {nudge.rule.name} · tier ${nudge.tier.lowerBound}–${nudge.tier.target}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100">
            <p className="text-xs text-bh-gray text-center">
              Add items to see live upsell nudges
            </p>
          </div>
        )}
      </div>

      {/* Cart lines */}
      <div className="px-5 py-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-bh-gray mb-3">
          Order Summary
        </p>
        {cart.length === 0 ? (
          <p className="text-sm text-bh-gray/60 italic py-6 text-center">
            Your bag is empty
          </p>
        ) : (
          <ul className="space-y-2">
            {cart.map((line) => {
              const url = line.heroImage
                ? urlForContentImage(line.heroImage)
                    .width(64)
                    .height(64)
                    .fit('crop')
                    .url()
                : null
              return (
                <li
                  key={line.menuItemId}
                  className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gradient-to-br from-stone-200 to-stone-300 shrink-0">
                    {url ? (
                      <Image
                        src={url}
                        alt={line.marketingName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-base">
                        🍽️
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bh-dark truncate">
                      {line.marketingName}
                    </p>
                    <p className="text-[11px] text-bh-gray">
                      ${line.unitPrice.toFixed(2)} ea
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 rounded-full px-1 py-0.5">
                    <button
                      onClick={() => onDecrement(line.menuItemId)}
                      className="w-6 h-6 rounded-full bg-white border border-gray-200 text-bh-gray hover:bg-bh-red hover:text-white hover:border-bh-red transition-colors text-sm font-bold"
                      aria-label={`Decrease ${line.marketingName}`}
                    >
                      −
                    </button>
                    <span className="text-xs font-bold text-bh-dark min-w-[1ch] text-center">
                      {line.qty}
                    </span>
                    <button
                      onClick={() => onIncrement(line.menuItemId)}
                      className="w-6 h-6 rounded-full bg-white border border-gray-200 text-bh-gray hover:bg-bh-red hover:text-white hover:border-bh-red transition-colors text-sm font-bold"
                      aria-label={`Increase ${line.marketingName}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemove(line.menuItemId)}
                    className="text-bh-gray/50 hover:text-bh-red text-xs ml-1"
                    aria-label={`Remove ${line.marketingName}`}
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Footer total */}
      <div className="bg-bh-cream px-5 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-bh-dark">Subtotal</span>
          <span className="text-xl font-bold text-bh-dark font-mono">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <button
          disabled={cart.length === 0}
          className="w-full py-3 rounded-full bg-bh-dark hover:bg-bh-charcoal disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold tracking-wide transition-colors"
        >
          Checkout
        </button>
      </div>
    </div>
  )
}
