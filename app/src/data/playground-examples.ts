import type { PlaygroundExample } from '@/lib/types'

export const PLAYGROUND_EXAMPLES_SEED: PlaygroundExample[] = [
  {
    id: 'ex-login',
    label: 'Login form',
    targetDescription: 'The email input',
    html: `<form>
  <label for="email">Email</label>
  <input id="email" type="email" placeholder="you@company.com" />
  <label for="pw">Password</label>
  <input id="pw" type="password" />
  <button type="submit" class="btn btn-primary">Sign in</button>
</form>`,
  },
  {
    id: 'ex-nav',
    label: 'Navigation bar',
    targetDescription: 'The Pricing link',
    html: `<nav aria-label="Main">
  <a href="/">Home</a>
  <a href="/pricing">Pricing</a>
  <a href="/docs">Docs</a>
  <button title="Open menu"><svg></svg></button>
</nav>`,
  },
  {
    id: 'ex-row',
    label: 'Data table row',
    targetDescription: 'The Edit button in the Widget row',
    html: `<table>
  <tr>
    <td>Widget</td>
    <td>In stock</td>
    <td><button>Edit</button><button>Delete</button></td>
  </tr>
</table>`,
  },
  {
    id: 'ex-modal',
    label: 'Modal dialog',
    targetDescription: 'The close button',
    html: `<div role="dialog" aria-label="Confirm deletion">
  <h2>Delete project?</h2>
  <p>This action cannot be undone.</p>
  <button title="Close"><svg aria-hidden="true"></svg></button>
  <button data-testid="confirm-delete">Delete</button>
</div>`,
  },
  {
    id: 'ex-cards',
    label: 'Card list',
    targetDescription: 'The card titled Invoices',
    html: `<section>
  <article class="css-1a2b3c">
    <h3>Reports</h3>
    <img alt="Reports icon" src="/r.svg" />
  </article>
  <article class="css-4d5e6f">
    <h3>Invoices</h3>
    <img alt="Invoices icon" src="/i.svg" />
  </article>
</section>`,
  },
  {
    id: 'ex-search',
    label: 'Unlabelled search',
    targetDescription: 'The search box',
    html: `<div class="toolbar">
  <input placeholder="Search products…" />
  <button data-testid="filter">Filter</button>
</div>`,
  },
]
