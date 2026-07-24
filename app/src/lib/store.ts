import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RankedLocator } from './types'

export const THEME = ['dark', 'light'] as const
export type Theme = (typeof THEME)[number]

export const STORAGE_KEY = 'locatr:store'
export const MAX_PLAYGROUND_HISTORY = 10

export type QuizAttempt = { date: number; score: number; total: number }

export type PlaygroundRun = {
  id: string
  date: number
  html: string
  description: string
  results: RankedLocator[]
}

type LocatrState = {
  theme: Theme
  bookmarks: string[]
  quizBest: number
  quizHistory: QuizAttempt[]
  playgroundHistory: PlaygroundRun[]
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  toggleBookmark: (slug: string) => void
  isBookmarked: (slug: string) => boolean
  recordQuiz: (score: number, total: number) => void
  addPlaygroundRun: (run: PlaygroundRun) => void
  resetLocalData: () => void
}

export const useLocatrStore = create<LocatrState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      bookmarks: [],
      quizBest: 0,
      quizHistory: [],
      playgroundHistory: [],
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (theme) => set({ theme }),
      toggleBookmark: (slug) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(slug)
            ? s.bookmarks.filter((b) => b !== slug)
            : [...s.bookmarks, slug],
        })),
      isBookmarked: (slug) => get().bookmarks.includes(slug),
      recordQuiz: (score, total) =>
        set((s) => ({
          quizHistory: [{ date: Date.now(), score, total }, ...s.quizHistory].slice(0, 50),
          quizBest: Math.max(s.quizBest, Math.round((score / total) * 100)),
        })),
      addPlaygroundRun: (run) =>
        set((s) => ({
          playgroundHistory: [run, ...s.playgroundHistory].slice(0, MAX_PLAYGROUND_HISTORY),
        })),
      resetLocalData: () =>
        set({ bookmarks: [], quizBest: 0, quizHistory: [], playgroundHistory: [] }),
    }),
    { name: STORAGE_KEY },
  ),
)
