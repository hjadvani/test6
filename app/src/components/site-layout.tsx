import type { ReactNode } from 'react'
import { SiteNav } from './site-nav'
import { useThemeEffect } from '@/lib/use-theme'

export function SiteLayout({ children }: { children: ReactNode }) {
  useThemeEffect()
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto w-full max-w-[72rem] flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-[72rem] px-4 py-6 sm:px-6">
          <p className="max-w-[70ch] text-xs leading-relaxed text-muted-foreground">
            Locatr is an independent educational tool that references the public Playwright
            locator API. It is not affiliated with or endorsed by Playwright or Microsoft.
            Playground analysis is heuristic and runs entirely in your browser — it does not
            execute Playwright.
          </p>
        </div>
      </footer>
    </div>
  )
}
