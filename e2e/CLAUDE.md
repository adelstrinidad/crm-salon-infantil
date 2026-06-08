# E2E Test Suite — AI Rules Orchestrator (crm-salon-infantil)

Always loaded for work under `e2e/`. High-level rules + an index of detailed
skills in `.claude/skills/`. Read the relevant skill before generating code.

> **This project is NOT a generic API+UI app.** It is a **single Next.js 16 app**
> (App Router) with **Server Actions** and **no REST/OpenAPI layer**. Tests drive
> the app **through the UI only**. The API-testing parts of the scaffold
> (`apiRequest` fixture, `fixtures/api/schemas`, OpenAPI status-matrix coverage,
> `@api` tag) **do not apply** and must not be created. See "Project Adaptation".

---

## Project Adaptation (read first)

| Scaffold assumption | This project |
|---|---|
| REST API + OpenAPI | **None.** Server Actions only — test via UI outcomes. |
| `apiRequest` fixture / Zod response schemas / `@api` tests | **N/A.** Do not create. |
| Auth per environment token | **Single seeded admin** (`admin@salon.local`). `e2e/tests/auth.setup.ts` logs in once → `storageState` (`.auth/admin.json`); the `e2e` project reuses it. Override creds with `E2E_ADMIN_*` env. |
| Generic URLs | Relative paths via `baseURL` (`http://localhost:3000`). Routes in `enums/app/routes.ts`. |
| Clean per-test DB | **Stateful dev.db**, `workers:1`, `fullyParallel:false`. Achieve isolation with **Faker factories + unique time slots** (`helpers/util/slot.ts`), not DB resets. A confirmed RESERVADO event can't overlap another → events need `uniqueSlot()`. |
| English UI | **Spanish UI**, English code/identifiers. Reusable UI strings → `enums/app/messages.ts`. Money shown in pesos (`$10.000`, es-AR), stored as cents — build expected strings with `helpers/util/money.ts`. |

**UI interaction recipes (this app's components):**
- **Radix `Select`** (e.g. "Tipo de evento", "Estado"): `getByLabel("…").click()` then `getByRole("option", { name }).click()`. Never `selectOption()`.
- **base-ui combobox / client picker** (e.g. "Seleccionar cliente…"): click the trigger text, then pick the `option`.
- **Event edit page autosaves** (no "Guardar cambios" button): after a change, assert `getByText("Guardado")` (`Messages.SAVED`).
- **Money**: assert with `money(10000)` → `"$10.000"`, not hardcoded strings.

---

## Constitution (Quick Reference)

### Role
Automation Test Architect (Playwright + TypeScript). Designs scalable, isolated,
type-safe UI/E2E suites for this single-app CRM.

### MUST
- **Dependency Injection:** Use fixtures from `e2e/fixtures/pom/test-options.ts`;
  never `new PageObject(page)` in a spec.
- **Imports:** Import `test`/`expect` from `fixtures/pom/test-options.ts` only;
  never `@playwright/test` in spec files (setup files excepted).
- **Selectors:** `getByRole()` > `getByLabel()` > `getByPlaceholder()` >
  `getByText()` > `getByTestId()`. No XPath, no CSS/attribute selectors
  (`locator('input[name=…]')`), no positional `.nth()` to pick a control.
- **Fix locators at the source.** If an input/trigger has no accessible name
  (e.g. a Radix `SelectTrigger`, a `<label>` without `htmlFor`), ADD the
  `aria-label` / associate the `<label htmlFor>`+`id` IN THE APP COMPONENT, then
  use `getByRole`/`getByLabel`. Never paper over a missing name with a CSS/`nth`
  workaround in the page object — that hides a real a11y gap.
- **Sources of truth:** Credentials from `process.env.*`. Routes, UI messages,
  storage-state paths from `enums/app/*` and `enums/util/*`. Seeded reference
  data and timeouts from `config/`. Never hardcode them.
- **Assertions:** Web-first (`expect(locator).toBeVisible()`); never
  `waitForTimeout()`.
- **Data Strategy:** Happy-path data from Faker factories
  (`test-data/factories/{area}/`); curated invalid/boundary sets in
  `test-data/static/{area}/` or `test-data/static/util/`. No hardcoded content.
- **Isolation:** Every created entity uses factory-generated unique names;
  events use `uniqueSlot()`. Tests never depend on another test's state.
- **Tags:** Exactly one per test — `@smoke`, `@sanity`, `@regression`, `@e2e`,
  or `@destructive`. (`@api` and `@functional` are forbidden here.)
- **Feedback selectors:** A form/CRUD page object must expose success/error
  locators, not just inputs.
- **Verification:** After adding/modifying a spec, run it
  (`npm run test:e2e -- <file>`) and confirm pristine pass.
- **Explore before generate:** Discover real selectors with `playwright-cli`
  (`goto` → `snapshot`) before writing a page object. No IDE/MCP browser
  substitutes. If `playwright-cli` or login fails, stop and notify the human.

### SHOULD
- `test.step()` with Given/When/Then for multi-action tests.
- JSDoc (`@param`/`@returns`) on **action methods only**, never on locator getters.
- Enums for repeated strings (routes, nav labels, messages).

### WON'T
- No XPath. No `waitForTimeout()`. No hardcoded credentials/content. No `any`.
- No tags on `test.describe()`. No multiple tags. No `@functional`/`@api`.
- No `new PageObject(page)` in specs.
- No page objects without success/error/validation locators.
- No explore-only/throwaway spec files committed.
- **No API/OpenAPI artifacts** (`apiRequest`, response schemas) — N/A here.

---

## AI Workflow
1. **Read this file** + the relevant skill(s) below.
2. **Explore** the target page with `playwright-cli` (`goto` → `snapshot`) to get
   real roles/labels. Skip only if the exact structure was provided.
3. **Locate existing code** — check `pages/`, `enums/`, `test-data/`.
4. **Write a test plan** (`test-plans/<area>.md`): scenarios, tags, data, risks.
5. **Build** page object(s) → register in `fixtures/pom/page-object-fixture.ts`
   → factory → spec. Use fixtures + enums + factories.
6. **Verify compliance** (`.claude/skills/common-tasks/SKILL.md` checklist).
7. **Run** `npm run test:e2e -- <file>`; on failure load
   `.claude/skills/debugging/SKILL.md`. Don't suppress failures or raise timeouts.
8. **Quality gates** (`.claude/skills/quality-gates/SKILL.md`) before PR.

---

## Skills Index
Detailed rules live in `.claude/skills/`. Read before generating in that area.

- `test-strategy` — coverage planning, pyramid, scenario placement, tags, severity.
- `quality-gates` — PR/release gates, skip policy.
- `playwright-cli` — required UI exploration (goto/snapshot).
- `page-objects` — POM shape, getter locators, composition, registration.
- `fixtures` — DI, mergeTests, fixture creation.
- `test-standards` — spec structure, imports, tagging, steps, assertions.
- `selectors` — selector priority, icon buttons, duplicate-role disambiguation.
- `data-strategy` — Faker factories, static TS data.
- `enums` — enum conventions.
- `config` — config/env patterns.
- `helpers` — shared utilities.
- `refactor-values` — moving/renaming enum & static values safely.
- `debugging` — failure taxonomy, traces, UI mode, CI replay.
- `type-safety` — TS strict, no-any. (Zod schemas only where useful; no API schemas.)
- `api-testing` — **N/A for this project (no REST API).** Skip.
- `ai-native-workflow` — onboarding, skill routing, lifecycle.
- `skill-creator` — authoring/improving skills.

---

## Structure (under `e2e/`)
```text
fixtures/pom/test-options.ts          — Single import point (test, expect)
fixtures/pom/page-object-fixture.ts   — Page-object DI registration
pages/{area}/*.page.ts                — Page objects
pages/components/*.component.ts       — Reusable UI (sidebar, …)
pages/auth/login.page.ts              — Login page object
tests/auth.setup.ts                   — storageState login (setup project)
tests/{area}/functional/*.spec.ts     — UI tests
tests/{area}/e2e/*.spec.ts            — Cross-page end-to-end flows
test-data/factories/{area}/*.factory.ts — Faker factories
test-data/static/{area}|util/*.ts     — Curated invalid/boundary data (TS, as const)
enums/app/{routes,messages}.ts        — Routes, UI strings, nav labels
enums/util/storage.ts                 — Storage-state paths
config/timeouts.ts                    — Named timeouts + seeded reference data
helpers/util/{money,slot}.ts          — Money formatting, unique event slots
test-plans/{area}.md                  — Per-area test plans
```

## Naming
| Type | Dir | Pattern |
|---|---|---|
| Page object | `pages/{area}/` | `[name].page.ts` |
| Component | `pages/components/` | `[name].component.ts` |
| Functional test | `tests/{area}/functional/` | `[name].spec.ts` |
| E2E flow | `tests/{area}/e2e/` | `[name].spec.ts` |
| Setup | `tests/` | `[name].setup.ts` |
| Factory | `test-data/factories/{area}/` | `[name].factory.ts` |
| Static data | `test-data/static/{area}/` | `[name].ts` |
