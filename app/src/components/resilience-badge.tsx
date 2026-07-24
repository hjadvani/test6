import { cn } from '@/lib/utils'
import { TIER_META } from '@/lib/resilience'
import type { Resilience } from '@/lib/types'

type ResilienceBadgeProps = {
  tier: Resilience
  className?: string
}

export function ResilienceBadge({ tier, className }: ResilienceBadgeProps) {
  const meta = TIER_META[tier]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        meta.badgeClass,
        className,
      )}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ backgroundColor: meta.chartVar }}
      />
      {meta.label}
    </span>
  )
}
