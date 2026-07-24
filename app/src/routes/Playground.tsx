import { useState } from 'react'
import { AlertTriangle, ChevronDown, History, Sparkles, Target } from 'lucide-react'
import { usePlaygroundExamples } from '@/data'
import { analyze } from '@/lib/analyzer'
import type { RankedLocator } from '@/lib/types'
import { useLocatrStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { RankedResult } from '@/components/ranked-result'
import { formatDistanceToNow } from 'date-fns'

type Status = 'idle' | 'ranked' | 'error'

export default function Playground() {
  const { data: examples } = usePlaygroundExamples()
  const addPlaygroundRun = useLocatrStore((s) => s.addPlaygroundRun)
  const history = useLocatrStore((s) => s.playgroundHistory)

  const [html, setHtml] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [results, setResults] = useState<RankedLocator[]>([])

  function handleRank() {
    const outcome = analyze(html)
    if (!outcome.ok) {
      setStatus('error')
      setErrorMsg(outcome.error)
      setResults([])
      return
    }
    setStatus('ranked')
    setResults(outcome.results)
    addPlaygroundRun({
      id: crypto.randomUUID(),
      date: Date.now(),
      html,
      description,
      results: outcome.results,
    })
  }

  function loadExample(exHtml: string, target: string) {
    setHtml(exHtml)
    setDescription(target)
    setStatus('idle')
    setResults([])
  }

  function restore(runHtml: string, runDesc: string, runResults: RankedLocator[]) {
    setHtml(runHtml)
    setDescription(runDesc)
    setResults(runResults)
    setStatus(runResults.length ? 'ranked' : 'idle')
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Locator playground
          </h1>
          <p className="max-w-[62ch] leading-relaxed text-muted-foreground">
            Paste a markup snippet and Locatr ranks the candidate locators by resilience —
            heuristically, in your browser. Great for building intuition on what to reach for.
          </p>
        </div>
        <HistorySheet history={history} onRestore={restore} />
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="html" className="text-sm font-medium">
              HTML snippet
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-1.5">
                  Load example <ChevronDown className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {(examples ?? []).map((ex) => (
                  <DropdownMenuItem key={ex.id} onClick={() => loadExample(ex.html, ex.targetDescription)}>
                    {ex.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Textarea
            id="html"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="<button>Sign in</button>"
            className="min-h-56 font-mono text-[0.8125rem] leading-relaxed"
            spellCheck={false}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="target" className="text-sm font-medium">
              Target element <span className="text-muted-foreground">(optional note)</span>
            </Label>
            <Input
              id="target"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. the email input"
            />
          </div>
          <Button type="button" onClick={handleRank} className="gap-2 self-start">
            <Sparkles className="size-4" />
            Rank locators
          </Button>
        </section>

        <section className="flex flex-col gap-3">
          {status === 'error' ? (
            <div className="flex items-start gap-3 rounded-md border border-[color-mix(in_srgb,var(--destructive),transparent_55%)] bg-[color-mix(in_srgb,var(--destructive),transparent_88%)] p-4">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <p className="text-sm text-foreground">{errorMsg}</p>
            </div>
          ) : status === 'ranked' ? (
            <>
              <p className="text-sm text-muted-foreground">
                {results.length} candidate{results.length === 1 ? '' : 's'}, best first.
              </p>
              {results.map((r, i) => (
                <RankedResult key={r.method + i} result={r} recommended={i === 0} index={i} />
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border py-20 text-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Target className="size-5" />
              </span>
              <p className="font-medium text-foreground">Paste markup and rank locators</p>
              <p className="max-w-[36ch] text-sm text-muted-foreground">
                Try a Load example to see how role and label locators outrank CSS and XPath.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function HistorySheet({
  history,
  onRestore,
}: {
  history: ReturnType<typeof useLocatrStore.getState>['playgroundHistory']
  onRestore: (html: string, desc: string, results: RankedLocator[]) => void
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <History className="size-4" />
          History
          {history.length > 0 && (
            <span className="rounded-full bg-secondary px-1.5 text-xs text-muted-foreground">
              {history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading">Recent runs</SheetTitle>
          <SheetDescription>Your last {history.length} playground runs, restorable.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2 overflow-y-auto px-4 pb-6">
          {history.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No runs yet.</p>
          ) : (
            history.map((run) => (
              <button
                key={run.id}
                type="button"
                onClick={() => onRestore(run.html, run.description, run.results)}
                className="flex flex-col gap-1 rounded-md border border-border bg-card p-3 text-left transition-colors hover:border-[color-mix(in_srgb,var(--primary),transparent_50%)]"
              >
                <span className="truncate font-mono text-xs text-muted-foreground">
                  {run.html.replace(/\s+/g, ' ').trim().slice(0, 48)}…
                </span>
                <span className="text-xs text-muted-foreground">
                  {run.description || 'No target note'} ·{' '}
                  {formatDistanceToNow(run.date, { addSuffix: true })}
                </span>
              </button>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
