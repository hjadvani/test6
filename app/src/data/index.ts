// Data layer — Locatr is a local-only educational app, so the "data" here is
// static seed content served through useData. Components import these hooks and
// never read the seed arrays directly.
import { useData } from '@/lib/data'
import type {
  Strategy,
  CheatEntry,
  QuizQuestion,
  PlaygroundExample,
} from '@/lib/types'
import { STRATEGIES_SEED } from './strategies'
import { CHEAT_SEED } from './cheatsheet'
import { QUIZ_SEED } from './quiz'
import { PLAYGROUND_EXAMPLES_SEED } from './playground-examples'

export function useStrategies() {
  return useData<Strategy[]>('strategies', 'seed', STRATEGIES_SEED)
}

export function useCheatEntries() {
  return useData<CheatEntry[]>('cheatEntries', 'seed', CHEAT_SEED)
}

export function useQuizQuestions() {
  return useData<QuizQuestion[]>('quizQuestions', 'seed', QUIZ_SEED)
}

export function usePlaygroundExamples() {
  return useData<PlaygroundExample[]>('playgroundExamples', 'seed', PLAYGROUND_EXAMPLES_SEED)
}
