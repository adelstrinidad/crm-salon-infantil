---
name: config
description: >
  Teaches how to manage Playwright configuration, environment variables, and
  project setup. Use when modifying playwright.config.ts, adding environment
  variables, configuring workers, or setting up project dependencies.
---

# Config Skill

## Context

Configuration changes affect every test. Prefer the existing project patterns
in `playwright.config.ts`, `config/**`, and `env/**`. Always verify broadly
after config changes, and never change worker count without a clear reason.

---

## Key Configuration Areas

### playwright.config.ts Patterns

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,         // CI: no .only allowed
  retries: process.env.CI ? 2 : 0,      // CI: retry flaky, local: no retry
  workers: process.env.CI ? 1 : undefined, // CI: 1 worker (avoids race conditions)
  reporter: 'html',

  use: {
    // baseURL: process.env.APP_URL,
    trace: 'on-first-retry',            // capture trace on first retry only
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Project dependencies — auth runs before tests
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
});
```

### Environment Variables

```bash
# env/.env.example — commit examples, never real secrets
APP_URL=
API_URL=
ACCESS_TOKEN=
ADMIN_ACCESS_TOKEN=
```

```typescript
// Access in tests/fixtures
process.env.APP_URL      // always from env — never hardcoded
process.env.API_URL
```

### Worker Scope Decision

| Workers | When | Why |
|---------|------|-----|
| 1 (CI default) | CI environment | Prevents shared resource race conditions |
| `undefined` (auto) | Local development | Uses all CPU cores for speed |
| Fixed number | Specific resource limits | e.g. API rate limits |

> Debbie's finding: running 10 workers with concurrent org creation caused 503 errors.
> Solution: worker-scoped fixtures share orgs instead of creating one per test.

---

## Anti-Patterns

```typescript
// ❌ Hardcoded URL in config
baseURL: 'https://staging.myapp.com',    // use process.env.APP_URL

// ❌ Retries on locally — hides flakiness
retries: 2,   // should be 0 locally

// ❌ trace: 'on' always — massive disk usage
trace: 'on',  // use 'on-first-retry'
```

---

## Related Skills
- `fixtures` — worker scoping to reduce parallel resource conflicts
- `debugging` — CI vs local configuration differences
