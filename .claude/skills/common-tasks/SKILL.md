---
name: common-tasks
description: >
  AI Prompt Templates for Playwright Scaffold. Contains prompt templates for
  common development tasks — use them as starting points when asking AI to
  generate code for this repository. Use when the task involves creating a
  page object, adding a test, adding an API schema, creating a factory,
  adding a fixture, or any other standard task. Delegates to specialized
  skills for deep rules. Triggers on "how do I add X", "create a", "generate a",
  "add a new", or any code generation request.
---

# AI Prompt Templates for Playwright Scaffold

This skill contains prompt templates for common development tasks. Use them as starting points when asking AI to generate code for this repository, and delegate to the specialized skills for the deep rules of each category.

---

## Guardrails

`CLAUDE.md` owns the global constitution. This skill keeps only the prompt-level
reminders needed while generating artifacts:

- Resolve every `{area}` placeholder with `ls` before writing paths.
- Spec files import `test` and `expect` from `fixtures/pom/test-options.ts`.
- Values come from the right source of truth: `process.env.*`, `enums/**`,
  `test-data/factories/**`, or `test-data/static/**`.
- UI work requires `playwright-cli` exploration before selectors or page objects.
- API work requires OpenAPI/Swagger first, then a status-code coverage plan.
- API specs use the `apiRequest` fixture. Raw Playwright `request` belongs only
  in fixture/helper internals; load `fixtures` before using it.
- After modifying tests, run affected tests. For release readiness, load
  `quality-gates`.

---

## Instructions

### Phase 1: Identify the task category

Match the user's request to one of the categories below. Each category has a dedicated prompt-template section later in this file and a specialized skill with the deep rules.

| Category | Template section | Specialized skill(s) |
|---|---|---|
| Coverage plan / suite balance | Test Strategy Tasks | `test-strategy`, `quality-gates` |
| Page object / component | Page Object Tasks | `page-objects`, `selectors`, `playwright-cli` |
| Functional / E2E test | Test Tasks | `test-standards`, `data-strategy` |
| API test | Test Tasks → Add API Test | `api-testing`, `test-standards` |
| Zod response schema | API Schema Tasks | `api-testing`, `type-safety` |
| Data factory | Data Factory Tasks | `data-strategy`, `type-safety` |
| Static test data | Data Factory Tasks → Static Test Data | `data-strategy`, `api-testing` |
| Fixture (POM / helper) | Fixture Tasks | `fixtures`, `helpers` |
| UI component | Component Tasks | `page-objects`, `selectors` |

### Phase 2: Discover the real area/path names

Every template below contains `{area}` as a placeholder. Before generating code, resolve it by running the relevant `ls` commands so paths and fixtures land in the right subdirectory.

| When you need... | Run |
|---|---|
| Page object location | `ls pages/` |
| Test location | `ls tests/` |
| Zod schema location | `ls fixtures/api/schemas/` |
| Data factory location | `ls test-data/factories/` |
| Static data location | `ls test-data/static/` |
| Endpoint enum location | `ls enums/` |

### Phase 3: Select and customize the matching prompt template

Open the template section identified in Phase 1. Copy the block that matches the specific task, then replace every bracketed `[PLACEHOLDER]` and every `{area}` with concrete values from Phase 2. Leave no unreplaced placeholders in the final prompt.

### Phase 4: Load the specialized skill when you need deep rules

The templates intentionally stay shallow. When the task needs more than the template's bullets — e.g., full status-code coverage for an API endpoint, selector exploration rules for a page object, or fixture composition patterns — load the specialized skill listed for that category in Phase 1 and follow it end-to-end. **Do not reimplement that skill's rules inline in your prompt.**

### Phase 5: Apply guardrails while generating

Re-read `CLAUDE.md` plus the specialized skill for the artifact before writing
code. Every generated file must obey the relevant hard-stop rules. If a template
and a specialized skill disagree, the specialized skill wins.

### Phase 6: Verify with the checklist

After generating code, confirm each box:

- [ ] Imports are from `fixtures/pom/test-options.ts` (never `@playwright/test` in specs)
- [ ] Paths, credentials, endpoints, routes, messages, roles, and storage-state paths come from `process.env.*`, `enums/{area}/*`, or `enums/util/*` — nothing hardcoded
- [ ] Locators follow `getByRole` / `getByLabel` / `getByPlaceholder` / `getByText` / `getByTestId` — no XPath
- [ ] No `any` types
- [ ] No hard waits (`waitForTimeout`)
- [ ] No JSDoc on locator getters/methods (JSDoc only on action methods)
- [ ] Multi-action tests use `test.step` with Given/When/Then structure; API tests with 2+ API calls step each call
- [ ] Each test has exactly ONE tag from `@smoke`, `@sanity`, `@regression`, `@e2e`, `@api`, `@destructive` (never `@functional`, never multiple)
- [ ] Tags live on individual tests, not on `test.describe()` blocks
- [ ] Tests that modify shared state are tagged **only** `@destructive` (which overrides any other importance tag)
- [ ] Happy-path test data uses factories; curated invalid values come from `test-data/static/util/` or `test-data/static/{area}/`
- [ ] Zod schemas use `z.strictObject()` — never `z.object()`
- [ ] API response validation uses `expect(SchemaName.parse(body)).toBeTruthy();`
- [ ] API tests with request bodies include empty-body + per-field omission + per-field invalid-type `for...of` loops (universal arrays imported from `test-data/static/util/invalid-values.ts`)
- [ ] **Coverage audit:** Every status code in the OpenAPI spec has a matching test (or `test.skip` + `// FIXME`)
- [ ] **Path parameter tests:** Endpoints with path params have the invalid-format data-driven loop
- [ ] **405 tests:** At least one unsupported HTTP method test per endpoint
- [ ] **Auth matrix:** Endpoints with `security` have both 401 (no token) and 403 (wrong role) tests
- [ ] **Behavior mismatches:** Any divergence from spec uses `test.skip` + `// FIXME: <ticket-url>`, never silent omission
- [ ] No explore-only or throwaway test files committed

### Phase 7: Run the affected tests and confirm zero failures

**MANDATORY:** After adding or modifying any test files, run the affected tests and confirm they all pass before marking the task complete. Do not finish the task with failing tests.

Run a specific test file:
```bash
npx playwright test tests/app/functional/todo.spec.ts
```

Run multiple files:
```bash
npx playwright test tests/app/functional/todo.spec.ts tests/app/e2e/todo.spec.ts
```

Run by tag (useful when adding tests to an existing suite):
```bash
npx playwright test --grep @smoke
```

Run all non-destructive tests:
```bash
npm test
```

**Failure protocol:**
1. **Read the error** — Playwright error messages identify the failing locator, assertion, or timeout.
2. **Investigate with the right tool** — Load the `debugging` skill for the failure-mode taxonomy and the right Playwright tool per failure (UI Mode for interactive replay, Trace Viewer for post-mortem, Inspector for breakpoint stepping, `npm run report` for the HTML report).
3. **Fix the root cause** — Update the page object locator, action method, or assertion. Do not suppress the failure (no `try/catch` on `expect`, no timeout bumps, no silent `.skip`).
4. **Re-run** — Confirm the fix makes the test pass; for flake fixes, run 5x consecutively.
5. **Do not finish** until all newly added tests pass consistently.

### Phase 8: Apply quality gates when appropriate

For PR or release readiness, load `quality-gates` after implementation checks
are green. Do not turn local affected-test verification into a full release
gate unless the user asks for release readiness.

---

## Prompt Templates

Quick reference for where each artifact lives:

| Task | Key Files | Primary Tool / Fixture |
|---|---|---|
| Add page object | `pages/{area}/` | `page-object-fixture.ts` |
| Add API schema | `fixtures/api/schemas/{area}/` | Zod |
| Add test | `tests/{area}/` | `test-options.ts` |
| Add API test | `tests/{area}/api/` | `apiRequest` fixture |
| Add setup/teardown | `fixtures/helper/` | `helper-fixture.ts` |
| Add data factory | `test-data/factories/{area}/` | Faker + Zod |
| Add component | `pages/components/` | N/A |

---

## Test Strategy Tasks

### Create A Coverage Plan

```
Create a coverage plan for [FEATURE].

Requirements:
- Load the test-strategy skill first.
- Identify risks and user-critical paths.
- Decide which scenarios belong in API, functional UI, E2E, or setup.
- Identify destructive scenarios and required cleanup.
- Identify required quality gates before merge/release.
- Do not generate test code until the coverage plan is accepted.
```

---

## Page Object Tasks

> **Important:** Before generating page objects, read the `playwright-cli` skill (`.claude/skills/playwright-cli/SKILL.md`) and run `playwright-cli` in the terminal (`goto`, `snapshot`, etc.). Do not use IDE browser MCP, Cursor browser tools, or any substitute — orchestrator rule **No Substitute UI Exploration**. If the CLI cannot run, stop and notify the human.

### Add a New Page Object (With Exploration)

```
Create a new page object for [PAGE NAME].

First, run `ls pages/` to find the correct area subdirectory (e.g., front-office, back-office).

Then use playwright-cli to navigate to [URL] and explore the page to discover:
- Element roles, labels, and accessible names
- Form field structure and validation
- Button names and available actions
- Any dynamic content or loading states

Then generate the page object with:
- File location: pages/{area}/[name].page.ts  (use real area name from ls)
- Accurate semantic locators based on exploration
- NO JSDoc on locator getters/methods — names are self-documenting
- JSDoc with @param and @returns on action methods only
- Registration in fixtures/pom/page-object-fixture.ts
```

### Add a New Page Object (Without Exploration)

Use this when you already know the exact element structure:

```
Create a new page object for [PAGE NAME] with the following elements:
- [List of elements/locators needed]
- [Actions the page should perform]

Requirements:
- File location: pages/{area}/[name].page.ts  (run `ls pages/` first to find real area name)
- Use semantic locators (`getByRole > getByLabel > getByPlaceholder > getByText > getByTestId`)
- NO JSDoc on locator getters/methods
- JSDoc with @param and @returns on action methods only
- Register in fixtures/pom/page-object-fixture.ts
- Follow the pattern from pages/app/app.page.ts
```

### Add Locators to Existing Page

```
Add the following locators to [PAGE_NAME] page object:
- [Element 1]: [description]
- [Element 2]: [description]

Use getByRole() as the primary selector strategy.
Add getter methods following the existing pattern.
```

### Add Action Method to Page Object

```
Add an action method to [PAGE_NAME] page object:
- Method name: [methodName]
- Purpose: [what it does]
- Parameters: [list parameters]
- Wait for: [API response or element state]

Include proper return type and JSDoc comment.
```

---

## Test Tasks

> **Important:** Before generating UI tests, use `playwright-cli` (`goto`, `snapshot`, and follow-up commands as needed) to understand the actual steps and expected outcomes. Do not use browser/codegen substitutes.

### Create a Functional Test

Functional tests verify one feature or behaviour in isolation. Each test covers a single thing.

```
Create a functional test for [FEATURE]:
- Location: tests/{area}/functional/[name].spec.ts  (run `ls tests/` first)
- Import from fixtures/pom/test-options.ts
- Use factory data from test-data/factories/{area}/ — never hardcode test content
- Tag with exactly ONE tag: @smoke | @sanity | @regression — or @destructive
  if the test modifies shared state (destructive overrides and is the only tag)
- Structure with test.describe; use Given/When/Then test.step blocks for
  multi-action flows
- Use beforeEach for navigation/setup

Test scenarios:
1. [Scenario 1]
2. [Scenario 2]
```

### Create an E2E Test

E2E tests chain multiple features together in a single test that mirrors a complete real user journey.

```
First, run `ls tests/` to find the correct area subdirectory.

Then navigate through the full flow at [STARTING_URL] to discover:
- The complete sequence of steps from start to finish
- Elements and state at each milestone
- Final expected state

Then generate the test with:
- Location: tests/{area}/e2e/[name].spec.ts  (use real area name from ls)
- A SINGLE test covering the entire journey (not one test per step)
- Factory data from test-data/factories/{area}/
- Tag: @e2e
- Steps that chain naturally: setup → action → action → ... → final assertion
```

### Add Data-Driven Tests

```
Add data-driven tests to [TEST FILE] for [SCENARIO]:
- Use static data from test-data/static/{area}/[file].ts  (run `ls test-data/static/` first)
- Import the named `as const` export; never redeclare inline
- Loop outside test blocks to generate individual tests
- Each test should have descriptive name including test data

Test data structure (test-data/static/{area}/[file].ts):

export const CASES = [
    { description: '', input: '', expected: '' },
] as const;
```

### Add API Test

```
Create an API test for [ENDPOINT]:
- HTTP method: [GET|POST|PUT|DELETE|PATCH]
- Endpoint: [/api/path]
- Request body schema: [describe fields and their types]
- Expected response schema: [describe fields]

FIRST: Source the contract. If OpenAPI / Swagger documentation exists, build
schemas and tests strictly from it. Only explore the live endpoint if no
documentation is available. Then build a coverage plan by listing every status
code from the spec for this endpoint, stating what test will cover each.
Present the plan before generating code.

Requirements:
- Create Zod schema in fixtures/api/schemas/{area}/ (run `ls fixtures/api/schemas/` first; use z.strictObject())
- Use the apiRequest fixture (destructured from test context)
- Validate every response with: expect(SchemaName.parse(body)).toBeTruthy();
- Pull endpoint paths from `enums/{area}/*` (e.g., `ApiEndpoints.PRODUCTS`) — never hardcode
- Pull URLs and tokens from process.env.* — never hardcode
- Tag with @api
- For invalid-type tests: use arrays from test-data/static/util/invalid-values.ts
  (INVALID_STRING_VALUES, INVALID_NUMBER_VALUES, etc.) — never redefine inline
- Field-specific boundary / range violations may stay inline in the spec
- Use factory data (generateX()) for the valid base payload
- For endpoints with path params: invalid format data-driven loop
  (numeric, boolean-like, special chars, SQL injection)
- For endpoints with auth: 401 (no token) and 403 (wrong role) tests
- For all endpoints: at least one 405 test with unsupported HTTP method
- Any test that would fail due to API bug: test.skip +
  /* eslint-disable playwright/no-skipped-test */ + // FIXME: <ticket-url>, never omit
```

---

## API Schema Tasks

> **Important:** Source schemas from OpenAPI / Swagger documentation when it exists. Only capture the live response shape as a fallback for undocumented endpoints. See the `api-testing` skill (Phase 1).

### Create a New Zod Schema (From Documentation — Default)

```
Create a Zod schema for [ENDPOINT] based on the OpenAPI / Swagger documentation.

First, run `ls fixtures/api/schemas/` to find the correct area subdirectory.

Then generate the schema from the documented contract:
- Location: fixtures/api/schemas/{area}/[name]Schema.ts  (use real area name from ls)
- Use z.strictObject() — never z.object()
- Field types, required/optional, nullability, and nested shapes exactly match the spec
- Proper Zod validators (z.email(), z.uuid(), z.url(), z.int(), etc.)
- Export both the schema and the inferred TypeScript type
- Follow the pattern from fixtures/api/schemas/app/userSchema.ts

If a runtime response disagrees with the schema later, that is a bug — report it
and wrap the test with test.skip + // FIXME: <ticket-url>.
Do NOT loosen the schema to match buggy behavior.
```

---

## Data Factory Tasks

### Create a New Data Factory

```
Create a data factory for [DATA TYPE]:
- Location: test-data/factories/{area}/[name].factory.ts  (run `ls test-data/factories/` first)
- Use @faker-js/faker for data generation
- Validate output with Zod schema from fixtures/api/schemas/
- Support overrides parameter for customization
- Keep externally constrained IDs as required refs passed into the factory

Fields to generate:
- [field1]: [faker method to use]
- [field2]: [faker method to use]
```

---

## Fixture Tasks

### Add a New Page Object Fixture

```
Create a new fixture for [PAGE OBJECT]:
- Location: fixtures/pom/page-object-fixture.ts (add to existing)
- Fixture name: [fixtureName]
- Purpose: [what page object it provides]

Requirements:
- Add type to FrameworkFixtures
- Add fixture with `async ({ page }, use) => { await use(new PageObject(page)); }`
- No separate fixture file needed for page objects
```

### Add a Helper Fixture (Setup/Teardown)

```
Create a helper fixture for [PURPOSE]:
- Location: fixtures/helper/helper-fixture.ts (add to existing)
- Fixture name: [fixtureName]
- Purpose: [what precondition it sets up and tears down]

Requirements:
- Add return type to HelperFixtures
- Use apiRequest from plain-function.ts for API calls
- Implement setup → use() → teardown pattern
- Setup: Create precondition via API before the test
- Yield: Pass created data to the test via use()
- Teardown: Clean up after the test (runs even on failure)
- Already merged into test-options.ts (no extra registration needed)
- Promote to a helper fixture only when the same setup/teardown is reused
  across 3+ spec files (see the fixtures skill)
```

### Add a New Fixture Category

```
Create a new fixture category for [PURPOSE]:
- Location: fixtures/[category]/[name]-fixture.ts
- Fixture name: [fixtureName]
- Purpose: [what it provides]

Requirements:
- Export test using base.extend<FixtureType>()
- Export the fixture types
- Add cleanup logic if needed
- Merge into fixtures/pom/test-options.ts via mergeTests()
```

### Component Tasks

```
Create a component object for [COMPONENT NAME](e.g., header, a date picker, a dropdown, a modal, sidebar):
- Location: pages/components/[name].component.ts
- Elements: [list of elements]
- Actions: [list of actions]

The component should be composable into page objects. Follow the pattern from pages/components/navigation.component.ts
```

Examples
Example 1: Add a new page and a functional test for it

Actions:
```
Phase 1 — Task categories: Page object + Functional test.
Phase 2 — Run ls pages/ and ls tests/ to resolve {area} (e.g., app).
Phase 3 — Copy Add a New Page Object (With Exploration) and Create a Functional Test templates; fill in [PAGE NAME], [URL], [FEATURE], scenarios.
Phase 4 — Load the playwright-cli skill for the exploration run; load page-objects for locator and registration rules; load test-standards for tagging and structure.
Phase 5 — Apply guardrails: getByRole first, no JSDoc on getters, one @smoke tag, factory data only.
Phase 6 — Walk the checklist.
Phase 7 — Run npx playwright test tests/app/functional/settings.spec.ts and confirm green.
```
