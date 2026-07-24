import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import type { Strategy } from '@/lib/types'
import { CATEGORY_LABEL } from '@/lib/resilience'
import { ResilienceBadge } from './resilience-badge'

export function StrategyCard({ strategy }: { strategy: Strategy }) {
  return (
    <Link
      to={`/guide/${strategy.slug}`}
      className="group flex flex-col gap-3 rounded-md border border-border bg-card p-5 transition-colors hover:border-[color-mix(in_srgb,var(--primary),transparent_45%)] hover:bg-[color-mix(in_srgb,var(--card),var(--primary)_5%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xs text-muted-foreground">#{strategy.priorityRank}</span>
          <h3 className="font-heading text-lg font-semibold text-foreground">{strategy.name}</h3>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{strategy.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        <ResilienceBadge tier={strategy.resilience} />
        <span className="text-xs text-muted-foreground">{CATEGORY_LABEL[strategy.category]}</span>
      </div>
    </Link>
  )
}
