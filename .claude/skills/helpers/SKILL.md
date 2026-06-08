---
name: helpers
description: >
  Teaches how to create and use shared utility helpers in the project. Use when
  a utility function is needed in 2+ places, or when extracting reusable logic
  from tests or page objects.
---

# Helpers Skill

## Context

Helpers are pure utility functions that don't belong in Page Objects, factories,
or fixtures. They are stateless, reusable, and have no Playwright dependencies.

---

## Where Helpers Live

```
helpers/
└── {area}/
    └── [name].helper.ts
```

---

## Recipe

```typescript
// helpers/{area}/[name].helper.ts

// ✅ Pure functions — no page, no fixtures, no side effects

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency })
    .format(amount);
}

export function generateDateRange(daysAgo: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - daysAgo);
  return { from, to };
}

export function parseOrderNumber(text: string): string {
  const match = text.match(/Order #(\w+)/);
  if (!match) throw new Error(`Could not parse order number from: "${text}"`);
  return match[1];
}
```

## Usage

```typescript
// In a test step
await test.step('Verify order total', async () => {
  await expect(checkoutPage.total).toContainText(
    formatCurrency(order.price)
  );
});

// In a factory
import { generateDateRange } from 'helpers/dates/date.helper';
const { from, to } = generateDateRange(30);
```

---

## Rules

- Helpers MUST be pure functions — no side effects
- If a function needs `page` or `expect` → it belongs in a Page Object, not here
- If a function generates test data → it belongs in a factory
- If a function is used in only ONE file → keep it inline, don't extract prematurely

---

## Related Skills
- `page-objects` — for Playwright-coupled utilities
- `data-strategy` — for test data generation

