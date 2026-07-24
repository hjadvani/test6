import { Link } from 'react-router-dom'
import { Award, Bookmark, FlaskConical, Trash2, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { useStrategies } from '@/data'
import { useLocatrStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function Progress() {
  const { data: strategies } = useStrategies()
  const bookmarks = useLocatrStore((s) => s.bookmarks)
  const quizBest = useLocatrStore((s) => s.quizBest)
  const quizHistory = useLocatrStore((s) => s.quizHistory)
  const playgroundHistory = useLocatrStore((s) => s.playgroundHistory)
  const resetLocalData = useLocatrStore((s) => s.resetLocalData)

  const bookmarked = (strategies ?? []).filter((s) => bookmarks.includes(s.slug))
  const hasData =
    bookmarks.length > 0 || quizHistory.length > 0 || playgroundHistory.length > 0

  function handleReset() {
    resetLocalData()
    toast.success('Local data cleared')
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            My progress
          </h1>
          <p className="max-w-[58ch] leading-relaxed text-muted-foreground">
            Everything here lives in your browser only — no account, no server.
          </p>
        </div>
        {hasData && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" className="gap-2 text-destructive">
                <Trash2 className="size-4" /> Reset local data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all local data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This clears your bookmarks, quiz history, best score, and playground runs.
                  This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </header>

      {!hasData ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border py-20 text-center">
          <p className="font-medium text-foreground">Start learning to see progress</p>
          <p className="max-w-[40ch] text-sm text-muted-foreground">
            Bookmark strategies, run the playground, or take the quiz — your activity shows up
            here.
          </p>
          <Button asChild size="sm">
            <Link to="/">Explore the guide</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            <StatTile icon={Bookmark} label="Bookmarks" value={bookmarks.length} />
            <StatTile icon={Trophy} label="Quiz best" value={`${quizBest}%`} />
            <StatTile icon={Award} label="Quizzes taken" value={quizHistory.length} />
            <StatTile icon={FlaskConical} label="Playground runs" value={playgroundHistory.length} />
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Bookmarked strategies
            </h2>
            {bookmarked.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookmarks yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {bookmarked.map((s) => (
                  <Link
                    key={s.slug}
                    to={`/guide/${s.slug}`}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-[color-mix(in_srgb,var(--primary),transparent_50%)] hover:text-foreground"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {quizHistory.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-lg font-semibold text-foreground">Recent quizzes</h2>
              <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border">
                {quizHistory.slice(0, 8).map((a, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 bg-card px-4 py-2.5">
                    <span className="text-sm text-foreground">
                      {a.score}/{a.total} correct
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(a.date, { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Bookmark
  label: string
  value: string | number
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-heading text-3xl font-semibold text-foreground">{value}</span>
    </div>
  )
}
