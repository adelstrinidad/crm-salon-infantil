---
name: playwright-cli
description: >
  Teaches how to use the required playwright-cli executable for live UI
  exploration before writing page objects, selectors, or UI-derived tests. Use
  when the task requires opening a page, navigating, taking an accessibility
  snapshot, inspecting roles/labels/text, or debugging UI discovery without
  banned browser/codegen substitutes.
---

# Playwright CLI Skill

## Context

`CLAUDE.md` requires UI exploration with the `playwright-cli` executable before
creating or editing `pages/**`, UI tests under `tests/**`, or selectors inferred
from the live app.

Do not use IDE browser tools, Cursor browser tools, Playwright Test `codegen`,
or `npx playwright open` as substitutes for this scaffold's exploration step.
If `playwright-cli` cannot run, the app cannot load, or auth fails, stop and
notify the human.

---

## Core Workflow

### Phase 1: Resolve The Target

Use source-of-truth values before opening a page:

- Base URLs come from `process.env.*` declared in `env/`.
- Routes come from `enums/{area}/*`.
- Storage-state paths come from `enums/{area}/*`.
- Real `{area}` folders must be discovered with `ls`.

```bash
ls pages
ls tests
ls enums
```

### Phase 2: Open Or Navigate

Use the local `playwright-cli` command exposed by the project environment.

```bash
playwright-cli open <url>
playwright-cli goto <url>
```

If the flow needs authenticated state, use the storage-state path that already
exists in the scaffold. Do not invent credentials or paths.

### Phase 3: Capture A Snapshot

```bash
playwright-cli snapshot
```

Use the snapshot to identify:

- accessible roles and names for `getByRole()`
- labels for `getByLabel()`
- placeholders only when labels are unavailable
- unique visible text only when role/label/placeholder cannot express the target
- `data-test` ids only when user-facing locators are unavailable

### Phase 4: Continue Exploration As Needed

Use additional `playwright-cli` commands for clicks, fills, navigation, or state
inspection when the first snapshot does not reveal enough structure. Keep the
output as evidence for selectors and page object methods.

---

## Rules

- Explore before writing or changing any UI selector.
- Use only `playwright-cli` for required scaffold exploration.
- Never use Playwright Test `codegen` to satisfy exploration.
- Never commit explore-only tests, generated recordings, screenshots, or
  temporary debug artifacts.
- Never invent UI text. If the snapshot does not prove it, keep exploring or
  ask the human.
- After exploration, route locator decisions to `selectors` and POM structure to
  `page-objects`.

---

## Anti-Patterns

```bash
# Bad: banned substitute for this scaffold's exploration requirement
npx playwright codegen <url>

# Bad: banned substitute for required exploration
npx playwright open <url>
```

```typescript
// Bad: guessed selector without snapshot evidence
this.page.getByRole('button', { name: 'Submit' });

// Bad: temporary pause committed
await page.pause();
```

---

## Related Skills

- `selectors` — locator priority and disambiguation after exploration
- `page-objects` — where explored locators and actions live
- `debugging` — tools for failing/flaky tests after implementation
