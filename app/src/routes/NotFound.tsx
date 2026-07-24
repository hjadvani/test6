import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="max-w-[45ch] text-muted-foreground">
        That route does not resolve. Head back to the strategy guide to keep exploring.
      </p>
      <Button asChild>
        <Link to="/">Back to the guide</Link>
      </Button>
    </div>
  )
}
