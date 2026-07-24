import { useMemo, useState } from 'react'
import { Check, Copy, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useCheatEntries } from '@/data'
import type { Resilience } from '@/lib/types'
import { RESILIENCE } from '@/lib/types'
import { TIER_META } from '@/lib/resilience'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResilienceBadge } from '@/components/resilience-badge'

const COPIED_RESET_MS = 1400

export default function CheatSheet() {
  const { data: entries, loading, error } = useCheatEntries()
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState<Resilience | 'all'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (entries ?? []).filter((e) => {
      const matchesTier = tier === 'all' || e.resilience === tier
      const matchesQuery =
        !q ||
        `${e.method} ${e.signature} ${e.example} ${e.use}`.toLowerCase().includes(q)
      return matchesTier && matchesQuery
    })
  }, [entries, query, tier])

  async function handleCopy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      toast.success('Copied to clipboard')
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), COPIED_RESET_MS)
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Cheat sheet
        </h1>
        <p className="max-w-[62ch] leading-relaxed text-muted-foreground">
          Every locator method and modifier at a glance. Search by name or use, filter by
          resilience, and copy the exact syntax.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search methods…"
            className="pl-9"
            aria-label="Search cheat sheet"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by resilience">
          <TierChip active={tier === 'all'} onClick={() => setTier('all')}>
            All
          </TierChip>
          {RESILIENCE.map((t) => (
            <TierChip key={t} active={tier === t} onClick={() => setTier(t)}>
              {TIER_META[t].label}
            </TierChip>
          ))}
        </div>
      </div>

      {error ? (
        <p className="py-12 text-center text-destructive">Could not load the cheat sheet.</p>
      ) : loading ? (
        <Skeleton className="h-96 w-full rounded-md" />
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center text-muted-foreground">
          No methods match “{query}”.
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                <TableHead className="w-[16%]">Method</TableHead>
                <TableHead className="w-[30%]">Example</TableHead>
                <TableHead className="w-[14%]">Resilience</TableHead>
                <TableHead>Use for</TableHead>
                <TableHead className="w-12 text-right">Copy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id} tabIndex={0} className="align-top">
                  <TableCell className="font-mono text-xs text-foreground">{e.method}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {e.example}
                  </TableCell>
                  <TableCell>
                    <ResilienceBadge tier={e.resilience} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.use}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-7 text-muted-foreground hover:text-foreground"
                      aria-label={`Copy ${e.method} example`}
                      onClick={() => handleCopy(e.id, e.example)}
                    >
                      {copiedId === e.id ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function TierChip({
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
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
