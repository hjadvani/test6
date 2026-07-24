import { RESILIENCE } from '@/lib/types'
import { TIER_META } from '@/lib/resilience'

const TIER_HINT: Record<(typeof RESILIENCE)[number], string> = {
  recommended: 'Reach for these first',
  solid: 'Dependable choices',
  situational: 'Use with care',
  fragile: 'Last resort',
}

export function ResilienceLegend() {
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2">
      {RESILIENCE.map((tier) => (
        <div key={tier} className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 rounded-full"
            style={{ backgroundColor: TIER_META[tier].chartVar }}
          />
          <dt className="text-sm font-medium text-foreground">{TIER_META[tier].label}</dt>
          <dd className="text-sm text-muted-foreground">— {TIER_HINT[tier]}</dd>
        </div>
      ))}
    </dl>
  )
}
