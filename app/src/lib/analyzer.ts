import type { RankedLocator } from './types'
import { scoreToTier } from './resilience'

export type AnalyzeResult =
  | { ok: true; element: string; results: RankedLocator[] }
  | { ok: false; error: string }

// Implicit ARIA roles for common elements — enough for an educational heuristic.
const ROLE_BY_TAG: Record<string, string> = {
  button: 'button',
  a: 'link',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
  nav: 'navigation',
  ul: 'list',
  ol: 'list',
  li: 'listitem',
  table: 'table',
  tr: 'row',
  img: 'img',
  select: 'combobox',
  textarea: 'textbox',
}

const HASHED_CLASS = /(?:^|[\s.])(css-[a-z0-9]{4,}|[a-z-]+-[0-9a-f]{5,})/i
const UTILITY_CLASS = /^(flex|grid|mt-|mb-|px-|py-|p-|m-|w-|h-|text-|bg-|rounded|gap-|items-|justify-)/

function esc(value: string): string {
  return value.replace(/'/g, "\\'")
}

function roleForInput(el: Element): string {
  const type = (el.getAttribute('type') || 'text').toLowerCase()
  if (type === 'checkbox') return 'checkbox'
  if (type === 'radio') return 'radio'
  if (type === 'submit' || type === 'button') return 'button'
  if (type === 'email' || type === 'text' || type === 'search' || type === 'tel' || type === 'url')
    return 'textbox'
  return 'textbox'
}

function accessibleName(el: Element, doc: Document): string | null {
  const aria = el.getAttribute('aria-label')
  if (aria) return aria.trim()
  const labelledby = el.getAttribute('aria-labelledby')
  if (labelledby) {
    const ref = doc.getElementById(labelledby)
    if (ref?.textContent) return ref.textContent.trim()
  }
  if (el.tagName === 'IMG') return el.getAttribute('alt')?.trim() || null
  const title = el.getAttribute('title')
  const text = el.textContent?.replace(/\s+/g, ' ').trim() || ''
  if (text && text.length <= 60) return text
  if (title) return title.trim()
  return null
}

function findLabel(el: Element, doc: Document): string | null {
  const id = el.getAttribute('id')
  if (id) {
    const label = doc.querySelector(`label[for="${CSS.escape(id)}"]`)
    if (label?.textContent) return label.textContent.replace(/\s+/g, ' ').trim()
  }
  const parentLabel = el.closest('label')
  if (parentLabel) {
    const clone = parentLabel.cloneNode(true) as HTMLElement
    clone.querySelectorAll('input, textarea, select').forEach((n) => n.remove())
    const t = clone.textContent?.replace(/\s+/g, ' ').trim()
    if (t) return t
  }
  return null
}

// Pick the most interesting element to analyze: prefer a form control or a
// button/link if one exists, else the first element with content.
function pickTarget(root: Element): Element | null {
  const preferred = root.querySelector(
    'input, textarea, select, button, a[href], img[alt]',
  )
  if (preferred) return preferred
  const withText = Array.from(root.querySelectorAll('*')).find(
    (n) => n.children.length === 0 && (n.textContent || '').trim(),
  )
  return withText || root.firstElementChild || root
}

export function analyze(html: string): AnalyzeResult {
  const trimmed = html.trim()
  if (!trimmed) return { ok: false, error: 'Paste an HTML snippet to analyze.' }

  const doc = new DOMParser().parseFromString(`<body>${trimmed}</body>`, 'text/html')
  const body = doc.body
  if (!body || body.children.length === 0) {
    return { ok: false, error: 'No HTML elements found. Check that your markup is valid.' }
  }

  const el = pickTarget(body)
  if (!el) return { ok: false, error: 'Could not identify an element to target.' }

  const tag = el.tagName.toLowerCase()
  const results: RankedLocator[] = []
  const name = accessibleName(el, doc)
  const label = findLabel(el, doc)
  const isFormControl = tag === 'input' || tag === 'textarea' || tag === 'select'

  // getByRole
  const role = isFormControl ? roleForInput(el) : ROLE_BY_TAG[tag]
  if (role) {
    const hasName = Boolean(name)
    const score = hasName ? 96 : 58
    results.push({
      method: 'getByRole',
      locator: hasName
        ? `page.getByRole('${role}', { name: '${esc(name as string)}' })`
        : `page.getByRole('${role}')`,
      score,
      tier: scoreToTier(score),
      rationale: hasName
        ? 'Role plus a stable accessible name — the recommended, refactor-proof locator.'
        : 'Correct role but no accessible name to disambiguate; add a name or another signal.',
    })
  }

  // getByLabel
  if (isFormControl && label) {
    results.push({
      method: 'getByLabel',
      locator: `page.getByLabel('${esc(label)}')`,
      score: 92,
      tier: scoreToTier(92),
      rationale: 'The field has an associated label — user-facing and stable.',
    })
  }

  // getByPlaceholder
  const placeholder = el.getAttribute('placeholder')
  if (isFormControl && placeholder) {
    const score = label ? 70 : 78
    results.push({
      method: 'getByPlaceholder',
      locator: `page.getByPlaceholder('${esc(placeholder)}')`,
      score,
      tier: scoreToTier(score),
      rationale: label
        ? 'Works, but prefer the real label — placeholders disappear on input.'
        : 'No label present, so placeholder is a solid user-facing fallback.',
    })
  }

  // getByAltText
  if (tag === 'img' && el.getAttribute('alt')) {
    results.push({
      method: 'getByAltText',
      locator: `page.getByAltText('${esc(el.getAttribute('alt') as string)}')`,
      score: 82,
      tier: scoreToTier(82),
      rationale: 'Alt text is the accessible, stable handle for an image.',
    })
  }

  // getByTitle
  const title = el.getAttribute('title')
  if (title && !name) {
    results.push({
      method: 'getByTitle',
      locator: `page.getByTitle('${esc(title)}')`,
      score: 55,
      tier: scoreToTier(55),
      rationale: 'title is a weak accessibility signal; use only when nothing better exists.',
    })
  }

  // getByText (non-interactive)
  const text = el.textContent?.replace(/\s+/g, ' ').trim() || ''
  if (!isFormControl && !role && text && text.length <= 60) {
    results.push({
      method: 'getByText',
      locator: `page.getByText('${esc(text)}')`,
      score: 68,
      tier: scoreToTier(68),
      rationale: 'Matches visible content; good for assertions, add { exact: true } if ambiguous.',
    })
  }

  // getByTestId
  const testId =
    el.getAttribute('data-testid') || el.getAttribute('data-test') || el.getAttribute('data-cy')
  if (testId) {
    results.push({
      method: 'getByTestId',
      locator: `page.getByTestId('${esc(testId)}')`,
      score: 74,
      tier: scoreToTier(74),
      rationale: 'Explicit test hook — very stable, though it does not verify accessibility.',
    })
  }

  // CSS
  const idAttr = el.getAttribute('id')
  const nameAttr = el.getAttribute('name')
  const className = el.getAttribute('class') || ''
  const classes = className.split(/\s+/).filter(Boolean)
  const hasHashed = HASHED_CLASS.test(className)
  const hasUtility = classes.some((c) => UTILITY_CLASS.test(c))
  if (nameAttr) {
    results.push({
      method: 'CSS',
      locator: `page.locator('[${tag === 'input' ? 'name' : 'name'}="${esc(nameAttr)}"]')`,
      score: 60,
      tier: scoreToTier(60),
      rationale: 'Scoped to a stable name attribute — acceptable CSS when semantics do not fit.',
    })
  } else if (idAttr) {
    results.push({
      method: 'CSS',
      locator: `page.locator('#${esc(idAttr)}')`,
      score: 50,
      tier: scoreToTier(50),
      rationale: 'Id selector works but couples the test to markup rather than semantics.',
    })
  } else if (classes.length) {
    const score = hasHashed ? 12 : hasUtility ? 22 : 40
    results.push({
      method: 'CSS',
      locator: `page.locator('${tag}.${esc(classes[0])}')`,
      score,
      tier: scoreToTier(score),
      rationale: hasHashed
        ? 'Hashed CSS-in-JS class — regenerates every build, extremely brittle.'
        : hasUtility
          ? 'Utility class — shared across many elements and changes with styling.'
          : 'Class-based selector; presentational classes change during redesigns.',
    })
  }

  // XPath (always available as the last resort, positional)
  results.push({
    method: 'XPath',
    locator: `page.locator('//${tag}')`,
    score: 15,
    tier: scoreToTier(15),
    rationale: 'Positional XPath is the most brittle option — avoid unless nothing else works.',
  })

  results.sort((a, b) => b.score - a.score)
  return { ok: true, element: `<${tag}>`, results }
}
