---
name: test-standards
description: >
  Defines spec-file standards for Playwright tests: imports, describe/test
  structure, naming, tags, test.step usage, assertion posture, data-driven loop
  shape, and cleanup expectations. Use when creating or reviewing test files.
  Route API coverage/schema details to api-testing, test data placement to
  data-strategy, page object design to page-objects, and locator details to
  selectors.
---

# Test Standards Skill

## Scope

This skill owns the structure of `tests/**` files. It deliberately does not
redefine deeper rules from specialized skills:

- API status-code coverage, `apiRequest` details, and Zod response contracts:
  use `api-testing`.
- Factory vs static data decisions: use `data-strategy`.
- Page object methods, locators, and fixture registration: use `page-objects`
  and `fixtures`.
- Locator priority and UI exploration: use `selectors` and `playwright-cli`.

`CLAUDE.md` remains the orchestrator. This skill is the deep rule set for test
shape only.

---

## Test File Structure

```typescript
// tests/{area}/functional/[name].spec.ts
// tests/{area}/api/[name].spec.ts
// tests/{area}/e2e/[name].spec.ts

import { expect, test } from '../../../fixtures/pom/test-options';
import { ApiEndpoints, Messages } from '../../../enums/app/app';
import { generateUser } from '../../../test-data/factories/app/user.factory';

test.describe('Feature or page name', () => {

  // One test = one user scenario
  test(
    'should <expected outcome> when <condition>',
    { tag: '@api' },  // ← tag is an OPTIONS OBJECT, never appended to name string
    async ({ apiRequest }) => {

      await test.step('Given: setup context', async () => {
        // preconditions
      });

      await test.step('When: user performs action', async () => {
        // action
      });

      await test.step('Then: verify outcome', async () => {
        // assertion
      });
    }
  );
});
```

---

## Naming Rules

| Item | Convention | Example |
|---|---|---|
| File | `[name].spec.ts` | `login.spec.ts` |
| Describe block | Feature or page name, no tag | `'api/login'`, `'Login Page'` |
| Test name | `'should <outcome> when <condition>'` | `'should return 401 for invalid credentials'` |
| Step | `'Given/When/Then: ...'` | `'When: user submits login form'` |

---

## Tagging Rules

Each test has exactly **ONE** tag passed as an options object — never appended to the test name string.

```typescript
// ✅ CORRECT — tag as options object
test(
  'should return 200 for valid login',
  { tag: '@api' },
  async ({ apiRequest }) => { ... }
);

// ❌ WRONG — tag appended to name string
test('should return 200 for valid login @api', async () => { ... });

// ❌ WRONG — tag on describe block
test.describe('Login @api', () => { ... });

// ❌ WRONG — multiple tags
test('name', { tag: ['@api', '@smoke'] }, async () => { ... });
```

### Valid tags

| Tag | When to use |
|---|---|
| `@smoke` | Critical happy-path, runs on every deploy |
| `@sanity` | Quick sanity check subset |
| `@regression` | Full regression suite |
| `@e2e` | End-to-end user flow |
| `@api` | API-only tests |
| `@destructive` | Tests that mutate or delete state — heaviest tag, always wins, never combined |

`@functional` is **forbidden**. `@destructive` tests MUST include `afterEach`/`afterAll` to revert state.

---

## Assertion Rules

```typescript
// ✅ Web-first — auto-wait built in
await expect(locator).toBeVisible();
await expect(locator).toContainText(Messages.LOGIN_SUCCESS);
await expect(locator).toBeEnabled();
await expect(page).toHaveURL(/checkout/);

// ✅ API response validation — exact pattern required by CLAUDE.md/api-testing
expect(LoginResponseSchema.parse(body)).toBeTruthy();

// ❌ No auto-wait, no retry
const visible = await locator.isVisible();
expect(visible).toBe(true);

// ❌ Bare schema parse — insufficient
LoginResponseSchema.parse(body);

// ❌ waitForTimeout
await page.waitForTimeout(3000);
```

---

## Data-Driven Tests

Use `for...of` when generating tests from data. Never use `forEach` in test
files because it hides async flow and produces worse reports.

The data source itself belongs to `data-strategy`: use Faker factories for
happy-path payloads, `test-data/static/util/invalid-values.ts` for universal
invalid type values, and `test-data/static/{area}/*.ts` for domain-specific
invalid or boundary sets.

```typescript
// ✅ from test-data/static/app/invalidCredentials.ts
import { INVALID_LOGIN_ATTEMPTS } from '../../../test-data/static/app/invalidCredentials';

for (const { description, email, password } of INVALID_LOGIN_ATTEMPTS) {
  test(
    `should return 401 for invalid credentials - ${description} - email: ${email} - password: ${password}`,
    { tag: '@api' },
    async ({ apiRequest }) => {
      const { status, body } = await apiRequest<UnauthorizedResponse>({
        method: 'POST',
        url: ApiEndpoints.LOGIN,
        baseUrl: process.env.API_URL,
        body: { email, password },
      });

      expect(status).toBe(401);
      expect(UnauthorizedResponseSchema.parse(body)).toBeTruthy();
    }
  );
}
```

---

## test.step() Requirements

Use named `test.step()` blocks with Given/When/Then for multi-action tests so
reports tell a readable story.

Mandatory cases:

- API tests with 2+ API calls: each API call must be inside its own
  `test.step()` and include validation.
- Flows with setup/action/assertion phases that would otherwise be hard to
  debug from the report.

For tiny one-action/one-assertion tests, steps are recommended but not required
unless `CLAUDE.md` or the relevant specialized skill says otherwise.

```typescript
// ✅ Steps for UI tests
await test.step('Given: user is on the login page', async () => {
  await loginPage.open();
});

await test.step('When: user submits invalid credentials', async () => {
  await loginPage.login('bad@email.com', 'wrongpassword');
});

await test.step('Then: error message is displayed', async () => {
  await expect(loginPage.errorMessage).toBeVisible();
});

// ✅ API tests with 2+ calls: step each API call
await test.step('When: POST /users/login with valid credentials', async () => {
  const { status, body } = await apiRequest<LoginResponse>({ ... });
  expect(status).toBe(200);
  expect(LoginResponseSchema.parse(body)).toBeTruthy();
});
```

---

## Cleanup And Isolation

Tests must be independent and safe to run in parallel.

- Use `test.beforeEach` for per-test setup instead of shared mutable state.
- Use `test.afterEach` or `test.afterAll` for cleanup when a test creates,
  mutates, or deletes backend state.
- Tests tagged `@destructive` must include cleanup hooks that revert the state
  change.
- Reusable setup/teardown needed by 3+ spec files belongs in
  `fixtures/helper/helper-fixture.ts`; load the `fixtures` skill before adding
  it.

---

## Verification

After adding or modifying a test file:

```bash
npx playwright test tests/{area}/path/to/affected.spec.ts
```

If the project has existing lint/typecheck scripts, run the affected checks too.
If the test fails or behaves unexpectedly, load `debugging`; do not suppress
expectations, increase timeouts, or remove coverage to make the result green.

---

## Anti-Patterns (NEVER)

```typescript
// ❌ Import from @playwright/test directly
import { test } from '@playwright/test';

// ❌ Tag on describe
test.describe('Login @smoke', () => { });

// ❌ Multiple tags
test('name', { tag: ['@api', '@smoke'] }, async () => { });

// ❌ Hardcoded strings
await expect(page.getByText('Successfully logged in')).toBeVisible();
// ✅ Use enum: Messages.LOGIN_SUCCESS

// ❌ No steps — unreadable failure reports
test('login', { tag: '@api' }, async ({ apiRequest }) => {
  const r = await apiRequest({ method: 'POST', url: '/users/login', ... });
  expect(r.status).toBe(200);
});

// ❌ forEach instead of for...of
INVALID_LOGIN_ATTEMPTS.forEach(({ email }) => {
  test(`fails for ${email}`, async () => { });
});
```

---

## Related Skills
- `page-objects` — where UI actions come from
- `fixtures` — setup/teardown fixtures and the single test import point
- `api-testing` — API test patterns in depth
- `data-strategy` — factories and static test data
- `selectors` — locator priority and UI exploration
- `debugging` — required when a modified test fails
