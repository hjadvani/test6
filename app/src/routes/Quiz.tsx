import { useMemo, useState } from 'react'
import { Award, Check, RotateCcw, X } from 'lucide-react'
import { useQuizQuestions } from '@/data'
import type { QuizQuestion } from '@/lib/types'
import { useLocatrStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { CodeBlock } from '@/components/code-block'

const LENGTHS = [5, 10] as const
type Phase = 'start' | 'playing' | 'results'
type Answer = { questionId: string; optionId: string; correct: boolean }

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function Quiz() {
  const { data: questions, loading } = useQuizQuestions()
  const quizBest = useLocatrStore((s) => s.quizBest)
  const recordQuiz = useLocatrStore((s) => s.recordQuiz)

  const [phase, setPhase] = useState<Phase>('start')
  const [deck, setDeck] = useState<QuizQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>([])

  const total = deck.length
  const score = useMemo(() => answers.filter((a) => a.correct).length, [answers])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const all = questions ?? []

  function start(length: number) {
    const count = Math.min(length, all.length)
    setDeck(shuffle(all).slice(0, count))
    setIndex(0)
    setSelected(null)
    setRevealed(false)
    setAnswers([])
    setPhase('playing')
  }

  function submit() {
    if (!selected) return
    const current = deck[index]
    const opt = current.options.find((o) => o.id === selected)
    setAnswers((a) => [
      ...a,
      { questionId: current.id, optionId: selected, correct: Boolean(opt?.isBest) },
    ])
    setRevealed(true)
  }

  function next() {
    if (index + 1 >= total) {
      recordQuiz(score, total)
      setPhase('results')
      return
    }
    setIndex((i) => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  if (phase === 'start') {
    return <StartCard best={quizBest} available={all.length} onStart={start} />
  }

  if (phase === 'results') {
    return <ResultsView deck={deck} answers={answers} score={score} onRetry={() => setPhase('start')} />
  }

  const current = deck[index]
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-muted-foreground">
          Question {index + 1} of {total}
        </span>
        <span className="font-mono text-sm text-muted-foreground">Score {score}</span>
      </div>
      <Progress value={((index + (revealed ? 1 : 0)) / total) * 100} />

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold text-foreground">{current.prompt}</h2>
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Markup</p>
          <CodeBlock code={current.html} copyable={false} />
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Goal:</span> {current.goal}
        </p>

        <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Candidate locators">
          {current.options.map((opt) => {
            const isSelected = selected === opt.id
            const showCorrect = revealed && opt.isBest
            const showWrong = revealed && isSelected && !opt.isBest
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={revealed}
                onClick={() => setSelected(opt.id)}
                className={cn(
                  'flex flex-col gap-1.5 rounded-md border p-3 text-left transition-colors',
                  showCorrect &&
                    'border-[color-mix(in_srgb,var(--chart-1),transparent_40%)] bg-[color-mix(in_srgb,var(--chart-1),transparent_88%)]',
                  showWrong &&
                    'border-[color-mix(in_srgb,var(--chart-5),transparent_40%)] bg-[color-mix(in_srgb,var(--chart-5),transparent_88%)]',
                  !revealed && isSelected && 'border-primary bg-[color-mix(in_srgb,var(--card),var(--primary)_6%)]',
                  !revealed && !isSelected && 'border-border bg-card hover:border-[color-mix(in_srgb,var(--primary),transparent_50%)]',
                  revealed && !showCorrect && !showWrong && 'border-border bg-card opacity-70',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-[0.8125rem] text-foreground">{opt.code}</code>
                  {showCorrect && <Check className="size-4 shrink-0 text-[var(--chart-1)]" />}
                  {showWrong && <X className="size-4 shrink-0 text-[var(--chart-5)]" />}
                </div>
                {revealed && (
                  <p className="text-sm leading-relaxed text-muted-foreground">{opt.rationale}</p>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex justify-end">
          {revealed ? (
            <Button type="button" onClick={next}>
              {index + 1 >= total ? 'See results' : 'Next question'}
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={!selected}>
              Check answer
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function StartCard({
  best,
  available,
  onStart,
}: {
  best: number
  available: number
  onStart: (length: number) => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 py-6">
      <div className="flex flex-col gap-2 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
          <Award className="size-5" />
        </span>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Judgement quiz
        </h1>
        <p className="mx-auto max-w-[46ch] leading-relaxed text-muted-foreground">
          Read a scenario, pick the most resilient locator, and see a ranked explanation of
          every option. Best score so far: <span className="font-medium text-foreground">{best}%</span>.
        </p>
      </div>
      <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-6">
        <p className="text-sm font-medium text-foreground">Choose a length</p>
        <div className="flex flex-wrap gap-2">
          {LENGTHS.filter((l) => l <= available).map((l) => (
            <Button key={l} type="button" variant="outline" onClick={() => onStart(l)}>
              {l} questions
            </Button>
          ))}
          <Button type="button" onClick={() => onStart(available)}>
            All {available}
          </Button>
        </div>
      </div>
    </div>
  )
}

function grade(pct: number): string {
  if (pct >= 90) return 'Locator whisperer'
  if (pct >= 70) return 'Solid instincts'
  if (pct >= 50) return 'Getting there'
  return 'Keep practising'
}

function ResultsView({
  deck,
  answers,
  score,
  onRetry,
}: {
  deck: QuizQuestion[]
  answers: Answer[]
  score: number
  onRetry: () => void
}) {
  const total = deck.length
  const pct = Math.round((score / total) * 100)
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-center gap-3 rounded-md border border-border bg-card p-8 text-center">
        <span className="font-heading text-5xl font-semibold text-foreground">
          {score}
          <span className="text-2xl text-muted-foreground">/{total}</span>
        </span>
        <p className="text-lg font-medium" style={{ color: 'var(--chart-1)' }}>
          {grade(pct)}
        </p>
        <Progress value={pct} className="max-w-xs" />
        <Button type="button" onClick={onRetry} className="mt-2 gap-2">
          <RotateCcw className="size-4" /> Retry
        </Button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Review</h2>
        {deck.map((q, i) => {
          const ans = answers[i]
          const chosen = q.options.find((o) => o.id === ans?.optionId)
          const best = q.options.find((o) => o.isBest)
          return (
            <div key={q.id} className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
              <div className="flex items-start gap-2">
                {ans?.correct ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-[var(--chart-1)]" />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0 text-[var(--chart-5)]" />
                )}
                <p className="text-sm font-medium text-foreground">{q.prompt}</p>
              </div>
              {!ans?.correct && chosen && (
                <p className="pl-6 text-sm text-muted-foreground">
                  You chose <code className="font-mono text-xs text-foreground">{chosen.code}</code>
                </p>
              )}
              {best && (
                <p className="pl-6 text-sm text-muted-foreground">
                  Best: <code className="font-mono text-xs text-foreground">{best.code}</code> — {best.rationale}
                </p>
              )}
            </div>
          )
        })}
      </section>
    </div>
  )
}
