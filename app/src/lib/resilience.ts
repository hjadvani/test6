import type { Resilience, Category } from './types'

type TierMeta = {
  label: string
  // chart token used for the tier's accent (dot, bar fill).
  chartVar: string
  // Tailwind classes for a soft badge: tinted bg + hairline border + readable text.
  badgeClass: string
}

export const TIER_META: Record<Resilience, TierMeta> = {
  recommended: {
    label: 'Recommended',
    chartVar: 'var(--chart-1)',
    badgeClass:
      'border-[color-mix(in_srgb,var(--chart-1),transparent_60%)] bg-[color-mix(in_srgb,var(--chart-1),transparent_86%)] text-[color-mix(in_srgb,var(--chart-1),var(--foreground)_25%)]',
  },
  solid: {
    label: 'Solid',
    chartVar: 'var(--chart-2)',
    badgeClass:
      'border-[color-mix(in_srgb,var(--chart-2),transparent_60%)] bg-[color-mix(in_srgb,var(--chart-2),transparent_86%)] text-[color-mix(in_srgb,var(--chart-2),var(--foreground)_25%)]',
  },
  situational: {
    label: 'Situational',
    chartVar: 'var(--chart-4)',
    badgeClass:
      'border-[color-mix(in_srgb,var(--chart-4),transparent_60%)] bg-[color-mix(in_srgb,var(--chart-4),transparent_86%)] text-[color-mix(in_srgb,var(--chart-4),var(--foreground)_25%)]',
  },
  fragile: {
    label: 'Fragile',
    chartVar: 'var(--chart-5)',
    badgeClass:
      'border-[color-mix(in_srgb,var(--chart-5),transparent_55%)] bg-[color-mix(in_srgb,var(--chart-5),transparent_84%)] text-[color-mix(in_srgb,var(--chart-5),var(--foreground)_25%)]',
  },
}

export const CATEGORY_LABEL: Record<Category, string> = {
  role: 'Role-based',
  label: 'Label',
  text: 'Text',
  attribute: 'Attribute',
  placeholder: 'Placeholder',
  alt: 'Alt text',
  title: 'Title',
  css: 'CSS engine',
  xpath: 'XPath engine',
  chain: 'Chaining',
}

// Map a 0-100 score to a resilience tier for consistent color coding.
export function scoreToTier(score: number): Resilience {
  if (score >= 80) return 'recommended'
  if (score >= 60) return 'solid'
  if (score >= 35) return 'situational'
  return 'fragile'
}
