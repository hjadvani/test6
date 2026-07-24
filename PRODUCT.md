# Product — Locatr

## Register
product

## What it is
Locatr is a public, interactive learning guide for Playwright's locator strategies.
It teaches test-automation engineers *which* locator to reach for and *why* — through
explained strategy chapters, a live "rank the best locator" playground for a snippet of
markup, a searchable cheat sheet, and a quiz that tests judgement (not memorization).

## Who it's for
QA and test-automation engineers learning or leveling up on Playwright, plus developers
new to end-to-end testing who need a trustworthy mental model for stable selectors.

## Core screens
1. **Guide** — the strategy library: one chapter per locator strategy (getByRole,
   getByLabel, getByText, getByTestId, getByPlaceholder, CSS, XPath, chaining/filtering).
2. **Strategy detail** — deep dive: anatomy, examples, resilience rating, pitfalls,
   related strategies.
3. **Playground** — paste an HTML snippet + describe the target element; the app ranks
   candidate locators from most to least recommended with reasoning.
4. **Cheat sheet** — dense, searchable/filterable reference with copyable syntax and a
   resilience score per locator.
5. **Quiz** — scenario questions (DOM + goal → pick the best locator); scored, with
   explanations, progress tracked locally.

## Tone & identity
Precise, opinionated, engineer-to-engineer. No marketing fluff. A confident dark
developer surface, monospace for all code, a decisive accent signalling
"recommended / stable" versus muted/red for fragile selectors. Resilience is a
first-class visual concept throughout.

## Persistence
Local (browser localStorage): quiz progress/scores, playground history, bookmarked
strategies, cheat-sheet filters. No backend, no login — fully public.

## Notes
- Do not stop to "initialize project context" — the context is already set up here.
- Never scaffold, install dependencies, or run a dev server; the platform owns the
  build and preview.
