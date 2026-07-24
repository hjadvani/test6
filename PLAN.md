# PLAN.md — Locatr

## APP
- Name: Locatr
- An interactive, opinionated learning guide for choosing the right Playwright locator
  strategy — guide chapters, a locator-ranking playground, a searchable cheat sheet, and
  a judgement-based quiz.
- Target users: QA / test-automation engineers learning or leveling up on Playwright, and
  developers new to end-to-end testing.
- Primary device: desktop-first (engineers at a workstation), fully mobile-responsive.

## FEATURES

1. **Strategy Guide (library)**
   - Landing/home surface listing every locator strategy as a chapter card: name, one-line
     summary, a "resilience" rating (Recommended / Solid / Situational / Fragile), and its
     recommended priority rank (Playwright's user-facing-locator order).
   - Filterable by resilience tier and by tag (role-based, text-based, attribute-based,
     engine CSS/XPath). Sortable by priority rank or A–Z.
   - Acceptance: all 10 seeded strategies render as cards; filtering by a tier hides
     non-matching cards; each card links to its detail route; a resilience legend is shown.

2. **Strategy Detail**
   - Deep dive on one strategy: full description, resilience rating with rationale, when to
     use / when to avoid (two contrasting lists), 2–4 annotated code examples (target HTML
     + the locator + a short note), common pitfalls, and related strategies (cross-links).
   - A "Bookmark" toggle (saved to localStorage) and a "Copy syntax" action on each example.
   - Acceptance: navigating to `/guide/:slug` shows that strategy; unknown slug shows a
     not-found state with a link back to the guide; bookmark state persists on reload.

3. **Locator Playground (ranking)**
   - Two inputs: an HTML snippet textarea (with a "Load example" menu of 4–6 realistic
     snippets) and a short description of the target element (free text) plus optional
     hints (has accessible name? has test id? is text stable?).
   - On "Rank locators", a deterministic client-side analyzer parses the snippet, inspects
     the element(s), and returns an ordered list of candidate locators (getByRole,
     getByLabel, getByText, getByTestId, getByPlaceholder, getByAltText, CSS, XPath) each
     with: the generated locator code, a resilience score 0–100, a color-coded tier, and a
     1–2 sentence rationale ("why higher/lower"). Best candidate is highlighted as
     "Recommended".
   - Each result row has "Copy". The run is saved to a local history list (last 10 runs),
     replayable.
   - Acceptance: pasting a snippet with a labelled input surfaces getByRole/getByLabel above
     CSS/XPath; invalid/empty HTML shows an inline error and does not crash; history entries
     restore both inputs and results.
   - Note: analysis is heuristic and rule-based in-browser (no Playwright runtime, no
     network) — see NOTES.

4. **Cheat Sheet**
   - Dense, single-screen searchable table/grid of every locator method: method signature,
     example call, resilience tier, primary use, and a copy button. Live text search + tier
     filter. Keyboard focusable rows.
   - Acceptance: typing "role" filters to matching rows; clearing search restores all;
     copy writes the exact syntax and toasts confirmation; empty search-result state shown.

5. **Quiz (judgement practice)**
   - Scenario questions: a DOM snippet + a stated goal + 4 candidate locators; user picks
     the best. After answering, reveal correctness, the ranked explanation of every option,
     and advance. Configurable length (5 / 10 / all). Running score, final results screen
     with per-question review, and best-score + attempts history (localStorage).
   - Acceptance: cannot advance without selecting; explanation shown after each answer;
     final screen shows score X/N, a resilience-themed grade, and "Retry" / "Review";
     best score persists across sessions.

6. **Bookmarks & progress (cross-cutting)**
   - A lightweight "My progress" surface (or panel) summarizing bookmarked strategies,
     quiz best score, quizzes taken, and playground runs — all from localStorage. Includes
     a "Reset local data" action with confirm dialog.
   - Acceptance: reflects live counts; reset clears all Locatr localStorage keys after
     confirmation and toasts.

## SCREENS
- **/** Guide library — hero strip (app name, one-line pitch, resilience legend), filter
  bar, responsive grid of strategy cards. Empty state (if filters exclude all): "No
  strategies match these filters" + Clear button. Loading: skeleton cards.
- **/guide/:slug** Strategy detail — breadcrumb, title + resilience badge + priority rank,
  description, use/avoid columns, code examples, pitfalls, related links, bookmark toggle.
  Not-found state for bad slug.
- **/playground** Locator Playground — split layout (inputs left/top, ranked results
  right/bottom), Load-example menu, Rank button, results list, history drawer. Empty state
  before first run ("Paste markup and rank locators"), error state for unparsable HTML,
  loading shimmer while analyzing.
- **/cheatsheet** Cheat Sheet — search + filter header, dense table, copy actions. Empty
  search state.
- **/quiz** Quiz — start card (length picker + best score), question view, results view
  with review. Empty/first-run state before starting.
- **/progress** Progress — summary cards for bookmarks/quiz/playground, reset action. Empty
  state when nothing tracked yet ("Start learning to see progress").
- Global: top navigation bar (Locatr wordmark + links: Guide, Playground, Cheat Sheet,
  Quiz, Progress), light/dark toggle (defaults dark), footer with a disclaimer that this is
  an educational tool referencing Playwright APIs. Mobile: nav collapses to a sheet menu.

## DATA MODEL & STATE
- **PERSISTENCE: local** — all data lives in the browser via localStorage (zustand store in
  `src/lib/store.ts` for UI state; a small persistence helper for saved data). No backend.
- **AUTH: public** — no sign-in concept; the app is a public educational tool. No login page.

Static content data (seeded in `src/data/`, served through `useData`-style hooks):

- **Strategy** (10+ rows): `slug`, `name` (e.g. "getByRole"), `summary`, `category`
  (`role` | `label` | `text` | `attribute` | `placeholder` | `alt` | `title` | `css` |
  `xpath` | `chain`), `resilience` (`recommended` | `solid` | `situational` | `fragile`),
  `priorityRank` (1..n), `description` (rich paragraphs), `useWhen` (string[]),
  `avoidWhen` (string[]), `pitfalls` (string[]), `examples` (`{ html, locator, note }[]`),
  `related` (slug[]). Seed all core Playwright strategies: getByRole, getByLabel,
  getByPlaceholder, getByText, getByAltText, getByTitle, getByTestId, CSS selector,
  XPath selector, and locator chaining/filtering (`.filter()`, `.getByRole().and()`).
- **CheatEntry** (15+ rows): `id`, `method`, `signature`, `example`, `category`,
  `resilience`, `use`. Covers the strategies above plus modifiers (`.first()`, `.last()`,
  `.nth()`, `.filter({ hasText })`, `.and()`, `.or()`, `exact:` option, `hasNotText`).
- **QuizQuestion** (15+ rows): `id`, `prompt`, `html` (DOM snippet), `goal`, `options`
  (`{ id, code, isBest, rationale }[]` — exactly one best), `topicSlug`. Scenarios span
  labelled inputs, ambiguous text, dynamic classes (fragile CSS), test-id vs role, nth
  vs filter, etc.
- **PlaygroundExample** (5+ rows): `id`, `label`, `html`, `targetDescription` — realistic
  markup (login form, nav bar, data table row, modal, card list).
- Persisted user state (localStorage keys under a `locatr:` prefix): `bookmarks` (slug[]),
  `quizHistory` (`{ date, score, total }[]`), `quizBest` (number), `playgroundHistory`
  (`{ date, html, description, results }[]`, max 10), UI prefs (theme, last filters).
- Seed data must be realistic and plentiful so every list/table/quiz feels alive
  (≥10 strategies, ≥15 cheat entries, ≥15 quiz questions, ≥5 playground examples).

## COMPONENTS (shadcn/ui)
- Layout/nav: `NavigationMenu` or custom top bar, `Sheet` (mobile menu), `Separator`,
  `Breadcrumb`, `Button`, `Toggle`/switch for theme.
- Guide: `Card`, `Badge` (resilience tiers), `ToggleGroup`/`Select` (filters), `Skeleton`.
- Detail: `Card`, `Badge`, `Tabs` (Examples / Pitfalls / Related optional), `Tooltip`,
  code blocks (custom, JetBrains Mono), `Button` (bookmark/copy), `Alert` (not-found).
- Playground: `Textarea`, `Input`, `DropdownMenu` (load example), `Button`, `Badge`,
  `Progress` (resilience score bar), `ScrollArea` / `Sheet` (history), `Alert` (errors).
- Cheat Sheet: `Table`, `Input` (search), `ToggleGroup` (tier filter), `Badge`, `Button`.
- Quiz: `Card`, `RadioGroup`, `Button`, `Progress`, `Badge`, `Alert` (explanations).
- Progress: `Card`, `Badge`, `AlertDialog` (reset confirm).
- Global: `Sonner` toasts (copy confirmations), `Tooltip`.

## DESIGN SYSTEM

### Design spec (prose)
- **Color mode: dark** (default; light theme fully supported via `.dark` token swap).
  Scene: a QA engineer working late in a dimly lit office, docs open beside a dark IDE,
  wanting a calm, trustworthy reference that matches their tooling — dark is forced.
- **Color strategy: committed.** A single olive-lime brand hue (~120°) owns the identity —
  primary actions, the "Recommended" tier, links, focus rings, and the strongest chart
  step. Lime reads as "the stable / passing / recommended path" (lint-clean, green tests),
  which is the app's core idea. Neutrals are tinted toward that hue; a warm amber accent
  (~65°) carries "situational / caution", and red (~25°) carries "fragile".
- **Palette (OKLCH, dark — see theme.json for the complete token set + light mode):**
  - background `oklch(0.16 0.010 120)`, card/popover `oklch(0.20 0.012 120)`,
    secondary/muted `oklch(0.24–0.26 0.012 120)`, border/input `oklch(0.28 0.014 120)`.
  - foreground `oklch(0.96 0.008 120)`, muted-foreground `oklch(0.72 0.018 120)`.
  - primary `oklch(0.80 0.155 120)` (lime-olive) with primary-foreground
    `oklch(0.20 0.030 120)` (dark text on the bright fill — fill L 0.80 pale enough for
    dark text to pass; verify AA).
  - accent `oklch(0.74 0.150 65)` (amber), destructive `oklch(0.62 0.190 25)` (red).
- **Semantic / resilience mapping:** Recommended = green `chart-1 oklch(0.78 0.16 145)`;
  Solid = brand lime `chart-2 oklch(0.80 0.155 120)`; Situational = amber
  `chart-4 oklch(0.74 0.150 65)`; Fragile = red `chart-5 oklch(0.62 0.190 25)`. Success =
  green, warning = amber, error = red, info = a cool blue `oklch(0.70 0.10 230)` if needed.
  The chart ramp is a deliberate green→lime→olive→amber→red diverging resilience sequence,
  not tints of one hue.
- **Contrast (WCAG AA):** body foreground on background well above 7:1; muted-foreground
  `0.72 L` on `0.16 L` bg ≥ 4.5:1 — keep muted text at/above this L, never lighter-and-
  fainter. Text on filled primary/accent uses the dark `*-foreground` tokens; text on red
  destructive fills uses near-white. Verify every chip/badge pair.
- **Font:** heading **Familjen Grotesk** (mechanical, exacting geometric grotesque — the
  wordmark and section titles); body **Overpass** (a DIN/Highway-Gothic humanist workhorse
  — readable at length, engineer-toned). Paired on a contrast axis (geometric display vs
  humanist workhorse), not two similar sans. Code uses **JetBrains Mono** everywhere code
  appears (examples, cheat signatures, playground snippets, quiz options) — mono here is
  literal content, not a display shorthand. All three loaded via the theme googleHref.
- **Layout:** persistent top navigation bar (not a sidebar) — this is a reference to move
  through, not a workspace. Content max-width ~72rem, generous but dense enough for tables.
  Guide grid `repeat(auto-fit, minmax(300px, 1fr))`. Playground splits to two panes on
  desktop, stacks on mobile. Dark-mode via `.dark` class swapping tokens (both sets in
  theme.json); default theme is dark.
- **Corner radius: 0.25rem** — crisp, slightly hard corners suit a precise developer tool;
  soft/pill rounding would read as consumer-friendly, not exacting. Pills only for badges.
- **Motion:** 150–220ms ease-out transitions on hover/focus, tier-badge and result-row
  state changes, and staggered entrance of ranked playground results (respects
  `prefers-reduced-motion` with a crossfade fallback). No decorative motion.
- Avoid AI tells: no cyan-on-dark, no purple gradients, no neon glow, no gradient text, no
  colored side-stripe cards, no cream/beige surfaces. Dark surfaces are brand-tinted olive
  near-black, not warm.

### theme.json
Written at workspace root; `mode: dark`; both `dark` and `light` token sets complete and
consistent with the palette above; `radius: 0.25rem`; fonts Familjen Grotesk / Overpass
(+ JetBrains Mono for code). Do not edit `src/main.tsx` or `vite.config.ts`.

## NOTES
- **Resolved ambiguity:** user gave no preferences, so the app is built as the fullest
  coherent product — all four requested-category modes (guide, playground/generator, cheat
  sheet, quiz) unified into one learning tool, aimed at QA/test-automation engineers.
- **Playground analysis is heuristic & fully client-side.** There is no Playwright runtime
  and no network calls: the app parses the pasted HTML with the browser's `DOMParser`,
  applies rule-based scoring (accessible name → getByRole/getByLabel high; stable test-id →
  getByTestId high; dynamic-looking classes → CSS low; positional XPath → lowest), and
  generates locator syntax as strings. It is an educational recommendation, clearly labeled
  as such — not a guarantee the locator resolves in a real page.
- **Non-goals:** running real tests, executing Playwright, accounts, sharing/collaboration,
  backend persistence.
- **Attribution:** footer notes Locatr is an independent educational tool referencing the
  public Playwright locator API; not affiliated with Playwright/Microsoft.
- Follow project guidelines: `@/` imports, routes in `src/routes/` (PascalCase, default
  export, `function`), data hooks in `src/data/`, store in `src/lib/store.ts`, shadcn UI +
  Tailwind tokens only (no raw hex), lucide icons, sonner toasts, date-fns. Every
  data-driven view handles loading → error → empty → data.
