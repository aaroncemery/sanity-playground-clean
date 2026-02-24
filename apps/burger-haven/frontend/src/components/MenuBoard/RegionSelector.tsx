'use client'

import {REGION_LABELS} from '@/lib/types'

const REGION_FLAGS: Record<string, string> = {
  california: '🌴',
  georgia: '🍑',
  texas: '⭐',
}

interface RegionSelectorProps {
  activeRegion: string
  onRegionChange: (region: string) => void
}

export function RegionSelector({activeRegion, onRegionChange}: RegionSelectorProps) {
  return (
    <div className="relative inline-flex items-center">
      <span className="absolute left-3 text-base pointer-events-none">
        {REGION_FLAGS[activeRegion] || '📍'}
      </span>
      <select
        value={activeRegion}
        onChange={(e) => onRegionChange(e.target.value)}
        className="appearance-none bg-white/10 hover:bg-white/20 text-white text-sm font-medium pl-9 pr-8 py-2.5 rounded-full border border-white/20 focus:outline-none focus:border-white/40 transition-all cursor-pointer backdrop-blur-sm"
      >
        {Object.entries(REGION_LABELS).map(([value, label]) => (
          <option key={value} value={value} className="bg-bh-dark text-white">
            {REGION_FLAGS[value]} {label}
          </option>
        ))}
      </select>
      <span className="absolute right-3 pointer-events-none text-white/50 text-xs">▾</span>
    </div>
  )
}
