import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Crosshair, Menu, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useLocatrStore } from '@/lib/store'

const NAV_LINKS = [
  { to: '/', label: 'Guide', end: true },
  { to: '/playground', label: 'Playground', end: false },
  { to: '/cheatsheet', label: 'Cheat Sheet', end: false },
  { to: '/quiz', label: 'Quiz', end: false },
  { to: '/progress', label: 'Progress', end: false },
] as const

function linkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-secondary text-foreground'
      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
  )
}

function ThemeToggle() {
  const theme = useLocatrStore((s) => s.theme)
  const toggleTheme = useLocatrStore((s) => s.toggleTheme)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground"
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex size-7 items-center justify-center rounded-sm bg-primary text-primary-foreground">
        <Crosshair className="size-4" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
        Locatr
      </span>
    </Link>
  )
}

export function SiteNav() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-[color-mix(in_srgb,var(--background),transparent_20%)] backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[72rem] items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden text-muted-foreground"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="font-heading">Menu</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                {NAV_LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setOpen(false)}
                    className={linkClass}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
