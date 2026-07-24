import { Link, useParams } from 'react-router-dom'
import { Bookmark, Check, ChevronRight, X } from 'lucide-react'
import { toast } from 'sonner'
import { useStrategies } from '@/data'
import type { Strategy } from '@/lib/types'
import { CATEGORY_LABEL } from '@/lib/resilience'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ResilienceBadge } from '@/components/resilience-badge'
import { CodeBlock } from '@/components/code-block'
import { useLocatrStore } from '@/lib/store'
import NotFound from './NotFound'

export default function StrategyDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: strategies, loading } = useStrategies()

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const strategy = strategies?.find((s) => s.slug === slug)
  if (!strategy) return <NotFound />

  return <StrategyView strategy={strategy} all={strategies ?? []} />
}

function StrategyView({ strategy, all }: { strategy: Strategy; all: Strategy[] }) {
  const bookmarks = useLocatrStore((s) => s.bookmarks)
  const toggleBookmark = useLocatrStore((s) => s.toggleBookmark)
  const bookmarked = bookmarks.includes(strategy.slug)

  function handleBookmark() {
    toggleBookmark(strategy.slug)
    toast.success(bookmarked ? 'Bookmark removed' : 'Bookmarked')
  }

  const related = strategy.related
    .map((r) => all.find((s) => s.slug === r))
    .filter((s): s is Strategy => Boolean(s))

  return (
    <article className="flex flex-col gap-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/" className="transition-colors hover:text-foreground">
          Guide
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{strategy.name}</span>
      </nav>

      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-muted-foreground">
            Priority #{strategy.priorityRank}
          </span>
          <ResilienceBadge tier={strategy.resilience} />
          <span className="text-sm text-muted-foreground">
            {CATEGORY_LABEL[strategy.category]}
          </span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {strategy.name}
          </h1>
          <Button
            type="button"
            variant={bookmarked ? 'default' : 'outline'}
            onClick={handleBookmark}
            className="gap-2"
          >
            <Bookmark className={cn('size-4', bookmarked && 'fill-current')} />
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
        </div>
        <div className="flex max-w-[68ch] flex-col gap-3">
          {strategy.description.map((p, i) => (
            <p key={i} className="text-pretty leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      </header>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <UseList title="Use it when" items={strategy.useWhen} tone="good" />
        <UseList title="Avoid it when" items={strategy.avoidWhen} tone="bad" />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">Examples</h2>
        <div className="flex flex-col gap-5">
          {strategy.examples.map((ex, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Target markup
              </p>
              <CodeBlock code={ex.html} copyable={false} />
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Locator
              </p>
              <CodeBlock code={ex.locator} label="locator" />
              <p className="text-sm leading-relaxed text-muted-foreground">{ex.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold text-foreground">Common pitfalls</h2>
        <ul className="flex max-w-[68ch] flex-col gap-2">
          {strategy.pitfalls.map((p, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--chart-4)]" />
              {p}
            </li>
          ))}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-xl font-semibold text-foreground">Related strategies</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/guide/${r.slug}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-[color-mix(in_srgb,var(--primary),transparent_50%)] hover:text-foreground"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

function UseList({
  title,
  items,
  tone,
}: {
  title: string
  items: string[]
  tone: 'good' | 'bad'
}) {
  const Icon = tone === 'good' ? Check : X
  const color = tone === 'good' ? 'var(--chart-1)' : 'var(--chart-5)'
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-5">
      <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
      <ul className="flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <Icon className="mt-0.5 size-4 shrink-0" style={{ color }} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
