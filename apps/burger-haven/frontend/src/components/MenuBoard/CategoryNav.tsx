'use client'

import {CATEGORY_LABELS} from '@/lib/types'

const CATEGORIES = ['all', 'burgers', 'chicken', 'breakfast', 'sides', 'drinks'] as const

const CATEGORY_ICONS: Record<string, string> = {
  all: '🍽️',
  burgers: '🍔',
  chicken: '🍗',
  breakfast: '🍳',
  sides: '🍟',
  drinks: '🥤',
}

interface CategoryNavProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
  counts: Record<string, number>
}

export function CategoryNav({activeCategory, onCategoryChange, counts}: CategoryNavProps) {
  return (
    <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat
        const label = cat === 'all' ? 'All Items' : (CATEGORY_LABELS[cat] || cat)
        const count = counts[cat] || 0
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-bh-dark text-white shadow-md'
                : 'bg-white text-bh-charcoal hover:bg-bh-warm border border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-base">{CATEGORY_ICONS[cat]}</span>
            <span>{label}</span>
            {count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-bh-gray'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
