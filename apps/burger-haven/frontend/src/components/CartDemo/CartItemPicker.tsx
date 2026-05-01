'use client'

import Image from 'next/image'
import {urlForContentImage} from '@/lib/sanity'
import type {CartLine, EnrichedMenuItem} from '@/lib/types'

interface Props {
  items: EnrichedMenuItem[]
  onAdd: (line: CartLine) => void
}

export function CartItemPicker({items, onAdd}: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-bh-gray italic">
        No menu items loaded — check your Sanity content.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => {
        const price = item.product?.basePrice ?? simulatedPrice(item)
        const url = item.heroImage
          ? urlForContentImage(item.heroImage).width(160).height(160).fit('crop').url()
          : null
        return (
          <button
            key={item._id}
            onClick={() =>
              onAdd({
                menuItemId: item._id,
                marketingName: item.marketingName,
                unitPrice: price,
                qty: 1,
                category: item.product?.category,
                heroImage: item.heroImage,
              })
            }
            className="group flex items-center gap-2 p-2 rounded-lg border border-gray-200 bg-white hover:border-bh-red hover:shadow-md transition-all text-left"
          >
            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gradient-to-br from-stone-200 to-stone-300 shrink-0">
              {url ? (
                <Image
                  src={url}
                  alt={item.heroImage?.alt || item.marketingName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  🍽️
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-bh-dark truncate">
                {item.marketingName}
              </p>
              <p className="text-[11px] text-bh-red font-semibold">
                ${price.toFixed(2)}
              </p>
            </div>
            <span className="text-bh-gray group-hover:text-bh-red text-lg leading-none">
              +
            </span>
          </button>
        )
      })}
    </div>
  )
}

function simulatedPrice(item: EnrichedMenuItem): number {
  // Stable hash-derived price between $2.49 and $9.99 when product data is missing
  const seed = item._id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const cents = (seed % 750) + 249
  return cents / 100
}
