import Image from 'next/image'
import {EnrichedMenuItem, ALLERGEN_EMOJI, BADGE_LABELS} from '@/lib/types'
import {urlForContentImage} from '@/lib/sanity'

interface ProductCardProps {
  item: EnrichedMenuItem
  region: string
  featured?: boolean
}

const BADGE_COLORS: Record<string, string> = {
  new: 'bg-blue-500',
  limited: 'bg-orange-500',
  favorite: 'bg-amber-500',
  value: 'bg-emerald-600',
  spicy: 'bg-red-600',
  fresh: 'bg-green-600',
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  burgers:   'from-orange-900 to-red-900',
  chicken:   'from-yellow-800 to-orange-800',
  breakfast: 'from-amber-800 to-yellow-900',
  sides:     'from-yellow-700 to-amber-800',
  drinks:    'from-blue-900 to-indigo-900',
  default:   'from-stone-800 to-stone-900',
}

const CATEGORY_EMOJI: Record<string, string> = {
  burgers:   '🍔',
  chicken:   '🍗',
  breakfast: '🍳',
  sides:     '🍟',
  drinks:    '🥤',
  default:   '🍽️',
}

export function ProductCard({item, region, featured}: ProductCardProps) {
  const price = item.pricing?.price ?? item.product?.basePrice
  const hasPromo = item.activePromotions && item.activePromotions.length > 0
  const imageUrl = item.heroImage
    ? urlForContentImage(item.heroImage).width(800).height(500).fit('crop').url()
    : null
  const category = item.product?.category ?? 'default'
  const gradient = CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.default
  const emoji = CATEGORY_EMOJI[category] ?? CATEGORY_EMOJI.default

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col border border-black/5`}>
      {/* Image / Hero area */}
      <div className={`relative bg-gradient-to-br ${gradient} overflow-hidden ${featured ? 'h-56' : 'h-44'}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.heroImage?.alt || item.marketingName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
        ) : (
          <>
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{backgroundImage: 'radial-gradient(circle at 30% 70%, white 0%, transparent 50%)'}}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="text-7xl drop-shadow-lg group-hover:scale-110 transition-transform duration-300 select-none"
                style={{filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))'}}
              >
                {emoji}
              </span>
            </div>
          </>
        )}

        {/* Gradient fade to white at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />

        {/* Badges — top left */}
        {item.badges && item.badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {item.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={`${BADGE_COLORS[badge] || 'bg-bh-red'} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md`}
              >
                {BADGE_LABELS[badge]?.replace(/^[^\s]+\s/, '') || badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 -mt-1">
        {/* Title + Price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display font-bold text-bh-dark text-lg leading-tight">
            {item.marketingName}
          </h3>
          {price !== undefined && (
            <span className="text-bh-red font-bold text-lg whitespace-nowrap">
              ${price.toFixed(2)}
            </span>
          )}
        </div>

        {item.tagline && (
          <p className="text-bh-red text-[11px] font-bold uppercase tracking-widest mb-2">
            {item.tagline}
          </p>
        )}

        {item.description && (
          <p className="text-bh-gray text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
            {item.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto space-y-2.5">
          {/* Calories + Allergens */}
          {item.product && (
            <div className="flex items-center justify-between text-xs text-bh-gray/60 border-t border-gray-100 pt-2.5">
              {item.product.nutritionFacts?.calories ? (
                <span className="font-medium">{item.product.nutritionFacts.calories} cal</span>
              ) : <span />}
              {item.product.allergens && item.product.allergens.filter(a => a !== 'none').length > 0 && (
                <div className="flex gap-0.5">
                  {item.product.allergens.filter(a => a !== 'none').slice(0, 5).map((allergen) => (
                    <span key={allergen} title={allergen} className="text-sm">
                      {ALLERGEN_EMOJI[allergen] || allergen}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Promo */}
          {hasPromo && item.activePromotions && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <p className="text-amber-800 text-xs font-semibold">
                {item.activePromotions[0].title}
              </p>
              {item.activePromotions[0].promoCode && (
                <p className="text-amber-600 text-xs mt-0.5">
                  Use code{' '}
                  <span className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                    {item.activePromotions[0].promoCode}
                  </span>
                </p>
              )}
            </div>
          )}

          {/* Regional pricing note */}
          {item.pricing && item.pricing.price !== item.product?.basePrice && (
            <p className="text-[11px] text-bh-gray/40 capitalize">{region} pricing</p>
          )}
        </div>
      </div>
    </div>
  )
}
