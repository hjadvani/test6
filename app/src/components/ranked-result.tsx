import { Check, Copy, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import type { RankedLocator } from '@/lib/types'
import { TIER_META } from '@/lib/resilience'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const COPIED_RESET_MS = 1400

export function RankedResult({
  result,
  recommended,
  index,
}: {
  result: RankedLocator
  recommended: boolean
  index: number
}) {
  const [copied, setCopied] = useState(false)
  const meta = TIER_META[result.tier]

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.locator)
      setCopied(true)
      toast.success('Locator copied')
      window.setTimeout(() => setCopied(false), COPIED_RESET_MS)
    } catch {
      toast.error('Could not copy')
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border bg-card p-4 [animation:result-in_260ms_ease-out_both]',
        recommended
          ? 'border-[color-mix(in_srgb,var(--primary),transparent_40%)] bg-[color-mix(in_srgb,var(--card),var(--primary)_7%)]'
          : 'border-border',
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {recommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              <Star className="size-3 fill-current" /> Recommended
            </span>
          )}
          <span className="font-mono text-sm font-medium text-foreground">{result.method}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">{result.score}</span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-7 text-muted-foreground hover:text-foreground"
            aria-label={`Copy ${result.method} locator`}
            onClick={handleCopy}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
      </div>

      <code className="block overflow-x-auto rounded-sm bg-[color-mix(in_srgb,var(--muted),transparent_25%)] px-2.5 py-1.5 font-mono text-[0.8125rem] text-foreground">
        {result.locator}
      </code>

      <div className="flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--muted),transparent_10%)]"
          role="presentation"
        >
          <div
            className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${result.score}%`, backgroundColor: meta.chartVar }}
          />
        </div>
        <span className="w-20 shrink-0 text-right text-xs font-medium" style={{ color: meta.chartVar }}>
          {meta.label}
        </span>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{result.rationale}</p>
    </div>
  )
}
