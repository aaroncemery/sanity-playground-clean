type BadgeType = 'new' | 'improved' | 'studio' | 'api' | 'developer'

interface ChangelogBadgeProps {
  badge: BadgeType
}

const BADGE_CONFIG: Record<
  BadgeType,
  {label: string; bg: string; text: string; ring: string}
> = {
  new: {
    label: 'New',
    bg: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-600/20',
  },
  improved: {
    label: 'Improved',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    ring: 'ring-yellow-600/20',
  },
  studio: {
    label: 'Studio',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-700/10',
  },
  api: {
    label: 'API',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    ring: 'ring-purple-700/10',
  },
  developer: {
    label: 'Developer',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    ring: 'ring-orange-600/20',
  },
}

export function ChangelogBadge({badge}: ChangelogBadgeProps) {
  const config = BADGE_CONFIG[badge]
  if (!config) return null
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${config.bg} ${config.text} ${config.ring}`}
    >
      {config.label}
    </span>
  )
}
