---
name: debugging
description: >
  Teaches how to diagnose and fix failing or flaky Playwright tests using the
  right tool for each failure mode. Use when a test is failing, behaving
  unexpectedly, flaky, or failing only on CI. Owns the failure-mode taxonomy,
  capture defaults, Playwright tool selection, and the CI-only failure replay
  workflow.
---

# Debugging Skill

## Context

Never suppress a failure. Never raise timeouts. Never `try/catch` an `expect`.
Every failure has a root cause — find it with the right tool, fix it properly.

---

## Failure Protocol (5 Steps)

1. **Read the error** — Playwright error messages identify the failing locator, assertion, or timeout.
2. **Investigate with the right tool** — match the failure mode to the tool below.
3. **Fix the root cause** — update the locator, action method, or assertion. Do not suppress.
4. **Re-run** — confirm the fix makes the test pass; for flake fixes, run 5× consecutively.
5. **Do not finish** until all newly added tests pass consistently.

---

## Bug Severity

Use severity to decide whether to stop, escalate, or continue after filing a
bug.

| Severity | Meaning | Action |
|---|---|---|
| P0 | Security vulnerability, data loss, app unavailable, critical path impossible | Stop work and escalate immediately |
| P1 | Major feature broken with no acceptable workaround | Block release unless explicitly waived |
| P2 | Important behavior broken with workaround or limited scope | File bug and include in release risk |
| P3 | Minor functional, copy, or usability issue | File bug; usually non-blocking |
| P4 | Cosmetic or documentation-only issue | Track as backlog |

When a failure reveals an API contract mismatch, use the `api-testing` FIXME
protocol and assign severity from the user impact. Do not downgrade a bug just
because the test can be skipped with a FIXME.

---

## Failure Mode → Tool Map

| Failure | Right Tool | Command |
|---|---|---|
| Wrong element / locator not found | Inspector — step through live | `npx playwright test <file> --debug` |
| Wrong flow / unexpected page state | UI Mode — interactive replay | `npx playwright test <file> --ui` |
| CI failure with no local repro | Trace Viewer — post-mortem | `npx playwright show-trace trace.zip` |
| Headless agent debugging (no GUI) | CLI debug mode | `npx playwright test <file> --debug=cli` |
| Read the HTML report offline | Report viewer | `npm run report` |
| Understand what requests fired | Network panel in UI Mode | `--ui` then Network tab |

### UI Mode (interactive replay)
```bash
npx playwright test tests/app/functional/login.spec.ts --ui
```
Use for: wrong page state, missing elements, incorrect flow order, auth issues.
Opens a GUI where you can step through each action, see DOM snapshots, and replay.

### Inspector (breakpoint stepping)
```bash
npx playwright test tests/app/functional/login.spec.ts --debug
```
Use for: pinpointing the exact line where a locator fails. Add `await page.pause()`
in code to pause at a specific point. **Remove `page.pause()` before committing.**

### Trace Viewer (post-mortem)
```bash
# Download trace.zip from CI artifacts, then:
npx playwright show-trace trace.zip
# With subcommands (Playwright 1.59+):
npx playwright trace open trace.zip
npx playwright trace actions trace.zip      # list all actions
npx playwright trace action <id> trace.zip  # inspect specific action
npx playwright trace snapshot <id> trace.zip
```
Use for: CI-only failures where you cannot reproduce locally.

### CLI debug (agentic / headless)
```bash
npx playwright test <file> --debug=cli
```
Use for: agent-driven debugging without a GUI. Step through actions via
`playwright-cli attach`.

---

## Common Root Causes and Fixes

| Error message | Root cause | Fix |
|---|---|---|
| `Timeout: waiting for locator` | Wrong selector / element not visible yet | Explore with `--debug`, fix locator using `getByRole` priority |
| `strict mode violation: resolved to X elements` | Selector too broad | Scope with `.filter({ hasText: '...' })` or parent container |
| `expect received false` | Using `.isVisible()` instead of `expect().toBeVisible()` | Replace with web-first assertion |
| `Zod parse error / unrecognized_keys` | API response has fields not in schema | Add missing fields to schema, or `test.skip` + `// FIXME` if API drift |
| `net::ERR_CONNECTION_REFUSED` | App not running / wrong `APP_URL` | Check `env/.env.dev`, confirm app is running |
| Test timeout exceeded | Hard wait or missing assertion | Replace `waitForTimeout` with `expect().toBeVisible()` |
| `Cannot read properties of undefined` | Schema parse failed or `any` type | Fix schema, remove `any` |

---

## Capture Defaults (What Playwright Saves on Failure)

Configured in `playwright.config.ts`:

```typescript
use: {
  trace: 'on-first-retry',        // trace captured on first retry
  screenshot: 'only-on-failure',  // screenshot on failure
  video: 'retain-on-failure',     // video retained on failure
}
```

On CI: artifacts are uploaded as `blob` reporter output and HTML report.
Download them, then open with `npx playwright show-report` or `show-trace`.

---

## Flaky Test Protocol

```bash
# Step 1: confirm flakiness baseline
npx playwright test <file> --repeat-each=5

# Step 2: identify root cause
# - Hard wait?          → replace with web-first assertion
# - CSS selector?       → replace with getByRole
# - Race condition?     → check if shared state is mutated in parallel
# - Stale data?         → use polling pattern (see below)
# - Missing teardown?   → add afterEach/afterAll or use helper fixture

# Step 3: fix, then verify
npx playwright test <file> --repeat-each=5
# All 5 runs must pass before claiming fixed
```

### Stale data / write-then-read race
```typescript
// ✅ Poll until consistent — never use waitForTimeout
await expect(async () => {
  const { status, body } = await apiRequest({
    method: 'GET',
    url: `${ApiEndpoints.PRODUCTS}/${id}`,
    baseUrl: process.env.API_URL,
  });
  expect(status).toBe(200);
  expect((body as Product).name).toBe(updatedName);
}).toPass({ timeout: 15_000, intervals: [1_000, 2_000, 3_000] });
```

---

## CI-Only Failure Replay Workflow

1. Download CI artifacts (trace zip + HTML report) from the Actions run
2. Open trace: `npx playwright show-trace trace.zip`
3. Compare: what did the page look like at failure vs local run?
4. Common CI-only causes:
   - Different worker count (`workers: 1` on CI vs unlimited locally)
   - Missing env vars — check `env/.env.example` vs CI secrets
   - Auth token expiry between setup and test run
   - Shared state mutation in parallel workers

```bash
# Reproduce CI conditions locally
npx playwright test --workers=1 --retries=0
```

---

## Anti-Patterns (NEVER)

```typescript
// ❌ Suppress failure with try/catch
try {
  await expect(locator).toBeVisible();
} catch { /* ignore */ }

// ❌ Raise timeout to make test pass
await expect(locator).toBeVisible({ timeout: 60000 });  // hiding flakiness

// ❌ Silent skip without FIXME
test.skip('this was failing', async () => { ... });

// ❌ page.pause() committed
await page.pause();  // blocks CI forever — remove before commit

// ❌ Hard wait as "fix"
await page.waitForTimeout(3000);
```

---

## Related Skills
- `selectors` — fixing locator-based failures
- `api-testing` — Phase 6 FIXME protocol for API behavior mismatches
- `fixtures` — fixing teardown and race condition failures
