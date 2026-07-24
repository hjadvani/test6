import type { Strategy } from '@/lib/types'

// Seed content: the core Playwright locator strategies, ordered by Playwright's
// user-facing locator priority. Kept as a static literal so useData can read it.
export const STRATEGIES_SEED: Strategy[] = [
  {
    slug: 'get-by-role',
    name: 'getByRole',
    summary: 'Query by ARIA role and accessible name — mirrors how users and AT perceive the UI.',
    category: 'role',
    resilience: 'recommended',
    priorityRank: 1,
    description: [
      'getByRole locates elements by their ARIA role, state, and accessible name. It is the locator Playwright recommends first because it reflects how real users — and assistive technology — perceive the page.',
      'Because it targets semantics rather than markup, it survives refactors: changing a class, wrapping the element, or reordering the DOM rarely breaks a role query.',
    ],
    useWhen: [
      'The element has a native or ARIA role (button, link, heading, checkbox, textbox…).',
      'It exposes a stable accessible name via text, aria-label, or a label element.',
      'You want tests that double as accessibility checks.',
    ],
    avoidWhen: [
      'The element is a generic div/span with no role and no accessible name.',
      'The accessible name is dynamic or localized in a way your test cannot pin.',
    ],
    pitfalls: [
      'name matches accessible name, not visible text verbatim — trailing/formatting differences matter.',
      'Use { exact: true } when several elements share a name prefix.',
    ],
    examples: [
      {
        html: '<button>Sign in</button>',
        locator: "page.getByRole('button', { name: 'Sign in' })",
        note: 'Native button role with visible text as the accessible name.',
      },
      {
        html: '<a href="/pricing">Pricing</a>',
        locator: "page.getByRole('link', { name: 'Pricing' })",
        note: 'Links expose the link role automatically.',
      },
      {
        html: '<h1>Dashboard</h1>',
        locator: "page.getByRole('heading', { name: 'Dashboard', level: 1 })",
        note: 'level narrows to a specific heading rank.',
      },
    ],
    related: ['get-by-label', 'get-by-text', 'get-by-test-id'],
  },
  {
    slug: 'get-by-label',
    name: 'getByLabel',
    summary: 'Find a form control by its associated <label> text — the way users identify fields.',
    category: 'label',
    resilience: 'recommended',
    priorityRank: 2,
    description: [
      'getByLabel finds a form control associated with a label, whether via the for/id pairing, wrapping, or aria-label / aria-labelledby.',
      'It is the preferred way to reach inputs because labels are user-visible and rarely change without the field itself changing.',
    ],
    useWhen: [
      'You are targeting an input, textarea, or select that has a real label.',
      'The form is accessible (labels correctly associated).',
    ],
    avoidWhen: [
      'The control has no label — reach for getByPlaceholder or getByRole instead.',
      'Multiple controls share the same label text without further scoping.',
    ],
    pitfalls: [
      'A placeholder is not a label — placeholder-only fields need getByPlaceholder.',
      'Partial matches are substring by default; pass { exact: true } to be strict.',
    ],
    examples: [
      {
        html: '<label for="email">Email</label>\n<input id="email" type="email" />',
        locator: "page.getByLabel('Email')",
        note: 'Explicit for/id association.',
      },
      {
        html: '<label>Password <input type="password" /></label>',
        locator: "page.getByLabel('Password')",
        note: 'Wrapping label also associates the control.',
      },
    ],
    related: ['get-by-role', 'get-by-placeholder'],
  },
  {
    slug: 'get-by-placeholder',
    name: 'getByPlaceholder',
    summary: 'Locate an input by its placeholder text when no proper label exists.',
    category: 'placeholder',
    resilience: 'solid',
    priorityRank: 3,
    description: [
      'getByPlaceholder targets inputs and textareas by their placeholder attribute. It is a good fallback when a field lacks an associated label.',
      'Prefer a real label when possible — placeholders vanish on input and are an accessibility anti-pattern — but this is far better than a brittle CSS selector.',
    ],
    useWhen: [
      'The input has a placeholder but no proper label.',
      'The placeholder text is stable and unique on the page.',
    ],
    avoidWhen: [
      'The field has a real label — use getByLabel instead.',
      'Placeholder text is localized or changes frequently.',
    ],
    pitfalls: [
      'Placeholders are not accessible names — this locator does not assert accessibility.',
      'Substring matching by default; use { exact: true } when needed.',
    ],
    examples: [
      {
        html: '<input placeholder="Search products…" />',
        locator: "page.getByPlaceholder('Search products…')",
        note: 'Matches the placeholder attribute.',
      },
    ],
    related: ['get-by-label', 'get-by-role'],
  },
  {
    slug: 'get-by-text',
    name: 'getByText',
    summary: 'Match non-interactive content by its visible text — great for assertions.',
    category: 'text',
    resilience: 'solid',
    priorityRank: 4,
    description: [
      'getByText finds elements containing the given text. It shines for locating and asserting on paragraphs, list items, and status messages.',
      'For interactive elements prefer getByRole (with a name) — text alone can match many nodes and does not convey the element type.',
    ],
    useWhen: [
      'You need to find or assert on non-interactive copy.',
      'The text is user-visible and reasonably unique.',
    ],
    avoidWhen: [
      'Targeting a button or link — getByRole is more precise.',
      'The text is long, dynamic, or repeated across the page.',
    ],
    pitfalls: [
      'Default matching is substring and case-insensitive; pass a RegExp or { exact: true } to tighten.',
      'Whitespace is normalized — multi-line text collapses to single spaces.',
    ],
    examples: [
      {
        html: '<p>Your order has shipped.</p>',
        locator: "page.getByText('Your order has shipped.')",
        note: 'Assert on a status message.',
      },
      {
        html: '<span>Welcome back, Sam</span>',
        locator: 'page.getByText(/welcome back/i)',
        note: 'RegExp handles the dynamic name portion.',
      },
    ],
    related: ['get-by-role', 'filter-locator'],
  },
  {
    slug: 'get-by-alt-text',
    name: 'getByAltText',
    summary: 'Locate images (and areas) by their alt attribute.',
    category: 'alt',
    resilience: 'solid',
    priorityRank: 5,
    description: [
      'getByAltText finds images, inputs of type image, and area elements by their alt text.',
      'It is the natural, accessible way to reach an image and, like alt text itself, tends to be stable.',
    ],
    useWhen: [
      'You are targeting an <img> that carries meaningful alt text.',
      'The alt text is descriptive and unique enough.',
    ],
    avoidWhen: [
      'The image is decorative with empty alt — nothing to match.',
      'Alt text is generic like "image".',
    ],
    pitfalls: ['Purely decorative images should have empty alt and are intentionally unmatchable.'],
    examples: [
      {
        html: '<img alt="Company logo" src="/logo.svg" />',
        locator: "page.getByAltText('Company logo')",
        note: 'Matches the alt attribute.',
      },
    ],
    related: ['get-by-role', 'get-by-title'],
  },
  {
    slug: 'get-by-title',
    name: 'getByTitle',
    summary: 'Find an element by its title attribute (tooltips, icon buttons).',
    category: 'title',
    resilience: 'situational',
    priorityRank: 6,
    description: [
      'getByTitle matches elements by the title attribute, often used for tooltips on icon-only controls.',
      'Titles are inconsistently exposed to assistive tech, so prefer a role + name where you can; use this when title is the only stable hook.',
    ],
    useWhen: [
      'An icon-only control exposes its purpose only through title.',
      'The title value is stable and unique.',
    ],
    avoidWhen: [
      'The element also has an accessible name — prefer getByRole.',
      'Titles are missing on mobile or hidden by the design.',
    ],
    pitfalls: ['title is not reliably announced by screen readers; it is a weak accessibility signal.'],
    examples: [
      {
        html: '<button title="Close dialog"><svg/></button>',
        locator: "page.getByTitle('Close dialog')",
        note: 'Reach an icon button via its title.',
      },
    ],
    related: ['get-by-role', 'get-by-alt-text'],
  },
  {
    slug: 'get-by-test-id',
    name: 'getByTestId',
    summary: 'Match a dedicated data-testid — explicit, opaque, and refactor-proof.',
    category: 'attribute',
    resilience: 'solid',
    priorityRank: 7,
    description: [
      'getByTestId targets an element by a test-only attribute (data-testid by default). It is the escape hatch when semantic and text locators do not fit.',
      'It is very stable because the attribute exists only for tests — but it does not verify accessibility and couples tests to markup the team must maintain.',
    ],
    useWhen: [
      'No good role, label, or text is available.',
      'The element is a generic container or a highly dynamic widget.',
      'Your team commits to keeping test ids in place.',
    ],
    avoidWhen: [
      'A semantic locator (role/label/text) would work just as well.',
      'You want the test to double as an accessibility check.',
    ],
    pitfalls: [
      'Configure testIdAttribute if your app uses data-test or data-cy.',
      'Over-reliance on test ids hides real accessibility gaps.',
    ],
    examples: [
      {
        html: '<div data-testid="cart-total">$42.00</div>',
        locator: "page.getByTestId('cart-total')",
        note: 'Opaque, stable hook for a generic node.',
      },
    ],
    related: ['get-by-role', 'css-selector'],
  },
  {
    slug: 'css-selector',
    name: 'CSS selector',
    summary: 'Raw CSS via locator() — powerful but coupled to styling and structure.',
    category: 'css',
    resilience: 'situational',
    priorityRank: 8,
    description: [
      'page.locator() with a CSS selector gives full querying power, but it ties your test to class names and DOM structure that exist for presentation, not testing.',
      'Reasonable when scoped to a stable attribute; risky when it leans on utility or hashed classes that change every build.',
    ],
    useWhen: [
      'You can target a stable attribute selector (e.g. [name="qty"]).',
      'Semantic locators genuinely do not apply.',
    ],
    avoidWhen: [
      'The selector depends on utility classes or generated class hashes.',
      'A role, label, or test id would be clearer and safer.',
    ],
    pitfalls: [
      'Hashed/utility classes (css-1a2b3c, flex, mt-4) break on any refactor.',
      'Deep descendant chains are fragile — one wrapper change breaks them.',
    ],
    examples: [
      {
        html: '<input name="quantity" />',
        locator: 'page.locator(\'[name="quantity"]\')',
        note: 'Scoped to a stable attribute — acceptable CSS.',
      },
      {
        html: '<div class="css-1a2b3c"> … </div>',
        locator: "page.locator('.css-1a2b3c')",
        note: 'Hashed class — fragile, avoid.',
      },
    ],
    related: ['xpath-selector', 'get-by-test-id'],
  },
  {
    slug: 'xpath-selector',
    name: 'XPath selector',
    summary: 'XPath via locator() — last resort; positional paths are the most brittle.',
    category: 'xpath',
    resilience: 'fragile',
    priorityRank: 9,
    description: [
      'XPath can express queries CSS cannot (text, axes, position), but positional and absolute paths are the most brittle way to find an element.',
      'Playwright supports XPath for edge cases, yet the docs steer you toward user-facing locators. Treat XPath as a last resort.',
    ],
    useWhen: [
      'You truly need an axis or relationship CSS cannot express.',
      'No semantic, text, or attribute locator is possible.',
    ],
    avoidWhen: [
      'Almost always — a user-facing locator is available.',
      'You are tempted to copy a browser-generated absolute path.',
    ],
    pitfalls: [
      'Absolute paths (/html/body/div[2]/…) shatter on any structural change.',
      'Index-based steps ([3]) silently target the wrong element after edits.',
    ],
    examples: [
      {
        html: '<ul><li>One</li><li>Two</li></ul>',
        locator: "page.locator('//li[2]')",
        note: 'Positional XPath — brittle, avoid.',
      },
    ],
    related: ['css-selector', 'filter-locator'],
  },
  {
    slug: 'filter-locator',
    name: 'Chaining & filtering',
    summary: 'Combine locators with .filter(), .and(), .nth() to disambiguate precisely.',
    category: 'chain',
    resilience: 'recommended',
    priorityRank: 10,
    description: [
      'Chaining scopes one locator inside another, and .filter({ hasText }), .and(), .or(), .nth() refine matches. This is how you disambiguate without resorting to fragile selectors.',
      'Prefer filtering by user-visible signals (text, a nested role) over positional .nth() where possible.',
    ],
    useWhen: [
      'Several similar elements need narrowing (rows, list items, cards).',
      'You want to scope a query to a specific region.',
    ],
    avoidWhen: [
      'A single semantic locator already resolves uniquely.',
      'You rely on .nth() for content that reorders.',
    ],
    pitfalls: [
      '.nth() is positional — reordering breaks it; filter by text/role instead.',
      'Over-chaining hurts readability; keep it purposeful.',
    ],
    examples: [
      {
        html: '<tr><td>Widget</td><td><button>Edit</button></td></tr>',
        locator:
          "page.getByRole('row', { name: 'Widget' }).getByRole('button', { name: 'Edit' })",
        note: 'Scope the button to its row by the row\u2019s name.',
      },
      {
        html: '<li>Apple</li><li>Banana</li>',
        locator: "page.getByRole('listitem').filter({ hasText: 'Banana' })",
        note: 'Filter by visible text instead of position.',
      },
    ],
    related: ['get-by-role', 'get-by-text'],
  },
]
