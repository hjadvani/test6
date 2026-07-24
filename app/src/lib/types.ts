// Shared domain types for Locatr.

export const RESILIENCE = ['recommended', 'solid', 'situational', 'fragile'] as const
export type Resilience = (typeof RESILIENCE)[number]

export const CATEGORIES = [
  'role',
  'label',
  'text',
  'attribute',
  'placeholder',
  'alt',
  'title',
  'css',
  'xpath',
  'chain',
] as const
export type Category = (typeof CATEGORIES)[number]

export type CodeExample = { html: string; locator: string; note: string }

export type Strategy = {
  slug: string
  name: string
  summary: string
  category: Category
  resilience: Resilience
  priorityRank: number
  description: string[]
  useWhen: string[]
  avoidWhen: string[]
  pitfalls: string[]
  examples: CodeExample[]
  related: string[]
}

export type CheatEntry = {
  id: string
  method: string
  signature: string
  example: string
  category: Category
  resilience: Resilience
  use: string
}

export type QuizOption = {
  id: string
  code: string
  isBest: boolean
  rationale: string
}

export type QuizQuestion = {
  id: string
  prompt: string
  html: string
  goal: string
  options: QuizOption[]
  topicSlug: string
}

export type PlaygroundExample = {
  id: string
  label: string
  html: string
  targetDescription: string
}

// A single ranked candidate produced by the analyzer engine.
export type RankedLocator = {
  method: string
  locator: string
  score: number
  tier: Resilience
  rationale: string
}
