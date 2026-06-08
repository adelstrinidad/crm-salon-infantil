---
name: selectors
description: >
  Teaches how to find, write, and debug Playwright locators following strict
  selector priority rules. Use when the task involves finding elements, writing
  getByRole/getByLabel locators, debugging why a selector doesn't match,
  handling icon-only buttons, or disambiguating duplicate roles after
  playwright-cli exploration.
---

# Selectors Skill

## Context

Playwright has a built-in priority for locators that aligns with how users perceive the UI.
Following this priority makes tests resilient to implementation changes (CSS class renames,
DOM restructuring, framework upgrades).

The golden rule: **explore with `playwright-cli` before writing any locator.
Never guess.** This skill owns locator choice; `playwright-cli` owns the
exploration commands, and `page-objects` owns where locators are stored.

---

## Locator Priority (Enforced Order)

| Priority | Locator | When to Use |
|----------|---------|-------------|
| 1 (best) | `getByRole()` | Buttons, links, headings, inputs with ARIA roles |
| 2 | `getByLabel()` | Form fields with associated `<label>` |
| 3 | `getByPlaceholder()` | Inputs with placeholder text and no label |
| 4 | `getByText()` | Unique visible text content |
| 5 | `getByTestId()` | Elements with `data-test` (only when above fail) |
| 6 (last) | CSS selector | Last resort only — document why |

**NEVER use XPath. NEVER use CSS class selectors like `.MuiButton-root`.**

---

## Recipe

### Phase 1: Explore the DOM
```bash
# Always run this first via the playwright-cli skill
playwright-cli goto <url>
playwright-cli snapshot
```

### Phase 2: Apply Priority Rules

**Standard button:**
```typescript
page.getByRole('button', { name: 'Submit' })
```

**Icon-only button (no visible text):**
```typescript
// Use aria-label
page.getByRole('button', { name: /close/i })
// Or if aria-label isn't set, use title
page.getByTitle('Close dialog')
```

**Disambiguating duplicate roles (e.g. two "Edit" buttons):**
```typescript
// Scope to parent container
page.getByRole('listitem').filter({ hasText: 'Invoice #123' })
  .getByRole('button', { name: 'Edit' })
```

**Form field with label:**
```typescript
page.getByLabel('Email address')
```

**Input without label (placeholder only):**
```typescript
page.getByPlaceholder('Search products...')
```

**Dynamic text matching (partial/regex):**
```typescript
page.getByText(/payment successful/i)
```

### Phase 3: Write Locators as Page Object Getters

All locators live in Page Objects as getters, never inline in tests:

```typescript
// pages/checkout/checkout.page.ts
export class CheckoutPage extends BasePage {
  // Locators as getters
  get emailInput() {
    return this.page.getByLabel('Email address');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Place Order' });
  }

  get successMessage() {
    return this.page.getByRole('heading', { name: /payment successful/i });
  }

  // Actions as methods
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }
}
```

### Phase 4: Verify the Locator

```typescript
// Use web-first assertions when verifying readiness or final state
await expect(locator).toBeVisible();
// Not: if (await locator.isVisible()) — this is a no-op anti-pattern
```

---

## Anti-Patterns (NEVER)

```typescript
// ❌ XPath
page.locator('//div[@class="btn"]')

// ❌ CSS class
page.locator('.MuiButton-root')

// ❌ nth() without context
page.getByRole('button').nth(2)   // fragile — add context instead

// ❌ Hard-coded text that's likely to change
page.getByText('Submit Order Now — Limited Time Offer!')

// ❌ No-op visibility check
if (await page.locator('#msg').isVisible()) { ... }
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Locator matches multiple elements | Scope with `.filter({ hasText: '...' })` or parent container |
| `getByRole` not finding element | Re-run `playwright-cli snapshot` and confirm the actual role/name |
| Icon button has no accessible name | Ask dev to add `aria-label` — or use `getByTitle()` as fallback |
| Element inside Shadow DOM | Use `page.locator('my-component').shadowRoot().locator(...)` |
| Element loads after navigation | Use `await expect(locator).toBeVisible()` — it auto-waits |

---

## Related Skills
- `page-objects` — where locators live
- `playwright-cli` — how to explore DOM before writing locators
