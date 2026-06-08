---
name: fixtures
description: >
  Teaches how the fixture system works in this scaffold — how test-options.ts
  merges all fixture files, how to add a page object fixture, how to add a
  helper fixture for setup/teardown, and when NOT to use fixtures. Use when
  the task involves adding a fixture, understanding the mergeTests pattern,
  creating setup/teardown, or deciding between a fixture and a beforeEach.
---

# Fixtures Skill

## Context

This scaffold merges three fixture files into a single import point:

```
fixtures/pom/test-options.ts          ← single import for all tests (do not add fixtures here)
  └── mergeTests(
        page-object-fixture.ts,       ← all page object fixtures live here
        api-request-fixture.ts,       ← apiRequest fixture
        helper-fixture.ts             ← setup/teardown fixtures
      )
```

Tests import ONLY from `fixtures/pom/test-options.ts`. Never import from the
individual fixture files directly in test files.

This skill owns fixture composition and setup/teardown fixture decisions. Page
object design belongs to `page-objects`, API assertion strategy belongs to
`api-testing`, and spec-file structure belongs to `test-standards`.

Raw Playwright `request` is allowed here because fixture setup/teardown runs
outside the spec-level `apiRequest` fixture. Spec files should still use
`apiRequest` from `fixtures/pom/test-options.ts`.

---

## The Three Fixture Files

### 1. `fixtures/pom/page-object-fixture.ts` — Page Objects

Every page object fixture lives here. Add to `FrameworkFixtures` type and
`base.extend<FrameworkFixtures>()`. Pattern is always the same:

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../../pages/app/login.page';
import { SettingsPage } from '../../pages/app/settings.page';

export type FrameworkFixtures = {
  loginPage: LoginPage;
  settingsPage: SettingsPage;
};

export const test = base.extend<FrameworkFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
});
```

No setup, no teardown — page objects are stateless. Just `new PageObject(page)`.

### 2. `fixtures/api/api-request-fixture.ts` — API Request

Provides the typed `apiRequest` function fixture. Do not modify unless changing
the request mechanism itself. Tests use it via `{ apiRequest }` destructuring.

### 3. `fixtures/helper/helper-fixture.ts` — Setup / Teardown

For multi-step API-driven setup and teardown that is reused across 3+ spec files.

```typescript
import { test as base } from '@playwright/test';
import { apiRequest } from '../api/plain-function';  // plain function, NOT the fixture

export type HelperFixtures = {
  createdProduct: Product;
};

export const test = base.extend<HelperFixtures>({
  createdProduct: async ({ request }, use) => {
    // ── SETUP: runs before the test ──────────────────────────────────────
    const { body } = await apiRequest<Product>({
      request,
      method: 'POST',
      url: ApiEndpoints.PRODUCTS,
      baseUrl: process.env.API_URL,
      body: generateProduct(refs),
    });
    const product = ProductSchema.parse(body);

    // ── YIELD: passes data to the test ───────────────────────────────────
    await use(product);

    // ── TEARDOWN: runs after the test, even on failure ───────────────────
    await apiRequest({
      request,
      method: 'DELETE',
      url: `${ApiEndpoints.PRODUCTS}/${product.id}`,
      baseUrl: process.env.API_URL,
      headers: process.env.ADMIN_ACCESS_TOKEN,
    });
  },
});
```

**Important:** Helper fixtures use `plain-function.ts` internally — NOT the
`apiRequest` fixture — because fixture-level code needs the raw `request` context.

---

## When to Use Each Pattern

| Situation | Use |
|---|---|
| Page object needed in test | `page-object-fixture.ts` |
| One-off API call in a single test | `apiRequest` fixture directly in test |
| Simple setup in one file | `beforeEach` / `afterEach` in the spec file |
| Multi-step setup reused across 3+ files | `helper-fixture.ts` |
| API assertion (status codes, response validation) | `apiRequest` fixture directly |

> **Do NOT create a helper fixture for every endpoint.** Most API calls belong
> directly in `beforeEach`/`afterEach` or in `test.beforeAll`/`test.afterAll`
> inside the spec file.

---

## How test-options.ts Works (Read-Only Pattern)

```typescript
// fixtures/pom/test-options.ts — DO NOT add fixtures here
import { test as base, mergeTests, request } from '@playwright/test';
import { test as pageObjectFixture } from './page-object-fixture';
import { test as apiRequestFixture } from '../api/api-request-fixture';
import { test as helperFixture } from '../helper/helper-fixture';

const test = mergeTests(pageObjectFixture, apiRequestFixture, helperFixture);
const expect = base.expect;

export { test, expect, request };
```

This file is the merge point only. When you add a fixture to any of the three
source files, it automatically becomes available in every test via this file.

---

## Adding a New Fixture — Decision Tree

```
Do tests in 3+ spec files need the same setup/teardown?
├── YES → Add to helper-fixture.ts
└── NO  → Use beforeEach/afterEach inside the spec file

Is it a page object?
└── YES → Add to page-object-fixture.ts (always)

Is it a completely new category of fixture (not POM, not API, not helper)?
└── YES → Create fixtures/[category]/[name]-fixture.ts
          Export test using base.extend<FixtureType>()
          Add to mergeTests() in test-options.ts
```

---

## Anti-Patterns (NEVER)

```typescript
// ❌ Add a page object fixture to test-options.ts directly
// test-options.ts is mergeTests() only

// ❌ Import from page-object-fixture.ts in a test
import { test } from '../../../fixtures/pom/page-object-fixture';

// ❌ Use apiRequest fixture inside a helper fixture
// helper-fixture.ts must use plain-function.ts, not the fixture

// ❌ Create a helper fixture for a single spec file
// Use beforeEach/afterEach instead

// ❌ Forget teardown in helper fixtures
createdProduct: async ({ request }, use) => {
  const product = await createProduct(request);
  await use(product);
  // ← missing teardown — product leaks forever
}
```

---

## Related Skills
- `page-objects` — what goes into page-object-fixture.ts
- `helpers` — pure utility functions (not fixtures)
- `api-testing` — apiRequest fixture usage in tests
