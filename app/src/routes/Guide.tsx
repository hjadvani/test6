import { useMemo, useState } from 'react'
import { useStrategies } from '@/data'
import type { Resilience } from '@/lib/types'
import { RESILIENCE } from '@/lib/types'
import { TIER_META } from '@/lib/resilience'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StrategyCard } from '@/components/strategy-card'
import { ResilienceLegend } from '@/components/resilience-legend'

const SORTS = [
  { id: 'rank', label: 'By priority' },
  { id: 'az', label: 'A–Z' },
] as const
type SortId = (typeof SORTS)[number]['id']

export default function Guide() {
  const { data: strategies, loading, error } = useStrategies()
  const [tier, setTier] = useState<Resilience | 'all'>('all')
  const [sort, setSort] = useState<SortId>('rank')

  const visible = useMemo(() => {
    const list = (strategies ?? []).filter((s) => tier === 'all' || s.resilience === tier)
    return [...list].sort((a, b) =>
      sort === 'az' ? a.name.localeCompare(b.name) : a.priorityRank - b.priorityRank,
    )
  }, [strategies, tier, sort])

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Playwright locator strategy
          </p>
          <h1 className="max-w-[20ch] text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
            Pick locators that survive the next refactor.
          </h1>
          <p className="max-w-[62ch] text-pretty leading-relaxed text-muted-foreground">
            A practical guide to every Playwright locator, ranked by how resilient it is.
            Explore the strategies, rank your own markup in the playground, and pressure-test
            your judgement with the quiz.
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <ResilienceLegend />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by resilience">
            <FilterChip active={tier === 'all'} onClick={() => setTier('all')}>
              All
            </FilterChip>
            {RESILIENCE.map((t) => (
              <FilterChip key={t} active={tier === t} onClick={() => setTier(t)}>
                {TIER_META[t].label}
              </FilterChip>
            ))}
          </div>
          <div className="flex items-center gap-1.5" role="group" aria-label="Sort">
            {SORTS.map((s) => (
              <FilterChip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)}>
                {s.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {error ? (
          <p className="py-12 text-center text-destructive">Could not load strategies.</p>
        ) : loading ? (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-md" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-16 text-center">
            <p className="text-muted-foreground">No strategies match these filters.</p>
            <Button variant="outline" size="sm" onClick={() => setTier('all')}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {visible.map((s) => (
              <StrategyCard key={s.slug} strategy={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-[color-mix(in_srgb,var(--primary),transparent_50%)]',
      )}
    >
      {children}
    </button>
  )
}
