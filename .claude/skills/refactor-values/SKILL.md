---
name: refactor-values
description: >
  Refactor existing hardcoded values, enum keys/values, route or endpoint
  constants, UI messages, storage-state paths, Faker factory defaults, and
  test-data/static values in an established Playwright scaffold. Use when a
  project already has tests and framework files, and a value must be renamed,
  moved to the correct source of truth, deduplicated, or migrated according to
  CLAUDE.md rules without breaking consumers.
---

# Refactor Values Skill

## Context

Use this skill when the codebase already exists and the task is to refactor
values safely. The goal is not just "replace strings"; it is to preserve the
scaffold's sources of truth while updating every consumer that depends on the
value.

`CLAUDE.md` is the authority:

- URLs and credentials come from `process.env.*` and are declared in `env/`.
- Endpoint paths, routes, UI messages, roles, and storage-state paths come from
  `enums/{area}/*` or `enums/util/*`.
- Dynamic happy-path data comes from `test-data/factories/{area}/`.
- Universal invalid arrays live in `test-data/static/util/invalid-values.ts`.
- Domain-specific invalid or boundary sets live in `test-data/static/{area}/*.ts`.
- Static data files are TypeScript with `as const` exports. JSON is forbidden.

Refactoring values is cross-cutting. Always inventory before editing, then
verify with TypeScript, linting, and the affected tests.

---

## Critical

- Never invent enum values, route paths, endpoint paths, UI messages, storage
  paths, credentials, or environment variable names.
- Never hardcode secrets, base URLs, endpoint paths, routes, reusable UI
  messages, storage-state paths, or repeated test data in spec files.
- Never replace a dynamic factory value with a static fixture unless the value
  is an intentional boundary, invalid case, or externally constrained reference.
- Never move static data to JSON. Use `.ts` with `as const` exports.
- Never update only the declaration. Search and update all consumers, including
  tests, factories, schemas, helpers, fixtures, page objects, setup files, and
  docs/examples in `.claude/skills/` when relevant.
- Never loosen schemas, add `any`, suppress test failures, or skip tests just to
  make a refactor pass.

---

## Phase 1: Classify The Value

Before changing code, decide what kind of value it is and where it belongs.

| Value kind | Source of truth |
|---|---|
| Base URL, token, credentials | `process.env.*` declared in `env/` |
| API endpoint path | `enums/{area}/*` (`ApiEndpoints`) |
| UI route path | `enums/{area}/*` (`Routes`) |
| UI message or reusable visible copy | `enums/{area}/*` (`Messages`) |
| Role, permission, shared app enum | `enums/util/*` or `enums/{area}/*` |
| Storage-state path | `enums/{area}/*` (`StorageStatePaths`) |
| Happy-path payload values | `test-data/factories/{area}/` with Faker |
| Universal invalid type values | `test-data/static/util/invalid-values.ts` |
| Domain invalid or boundary values | `test-data/static/{area}/*.ts` |
| One-test-only boundary | Inline in the spec, with a clear name if helpful |

If the value belongs to UI behavior and the current text/path is unknown,
explore with `playwright-cli` only. If it belongs to API behavior, use
OpenAPI/Swagger as the source of truth first.

---

## Phase 2: Inventory Impact

Resolve real folder names before touching files. Do not use the literal
placeholder `{area}`.

```bash
ls enums
ls test-data/factories
ls test-data/static
rg "old literal or key"
rg "EnumName|CONSTANT_NAME|factoryFunctionName"
```

Check the likely consumers:

- `tests/**`
- `pages/**`
- `fixtures/**`
- `helpers/**`
- `config/**`
- `enums/**`
- `test-data/**`
- `.claude/skills/**` if the skill documentation contains stale examples

For non-trivial changes, propose scope before editing:

```text
I found OLD_VALUE in:
- enums/app/app.ts: endpoint declaration
- tests/app/api/products.spec.ts: request URL usage
- test-data/factories/app/product.factory.ts: generated payload override

I will move the reusable value to ApiEndpoints, update consumers to import it,
and run typecheck/lint plus the affected spec.
```

---

## Phase 3: Refactor By Scenario

### Rename Or Change An Enum Value

Use this for endpoint paths, routes, messages, roles, and storage-state paths.

```typescript
// enums/app/app.ts
export enum ApiEndpoints {
    PRODUCTS = '/products',
    PRODUCT_IMAGES = '/product-images',
}
```

Consumers import the enum rather than repeating the string:

```typescript
import { ApiEndpoints } from '../../../enums/app/app';

const { status, body } = await apiRequest({
    method: 'GET',
    url: ApiEndpoints.PRODUCTS,
    baseUrl: process.env.API_URL,
});
```

When changing enum keys, update every reference to the key. When changing enum
values, confirm the new value from the API docs or UI exploration first.

### Move Repeated Hardcoded Test Content

If the value is reusable happy-path data, move it to a Faker factory.

```typescript
// test-data/factories/app/user.factory.ts
export const generateUser = (overrides?: Partial<UserRequest>): UserRequest =>
    UserRequestSchema.parse({
        email: faker.internet.email(),
        password: faker.internet.password(),
        ...overrides,
    });
```

If the value is invalid or boundary data reused across tests, move it to
`test-data/static/{area}/*.ts`.

```typescript
// test-data/static/app/invalidCredentials.ts
export const INVALID_EMAILS = [
    '',
    'plaintext',
    'missing-at-sign.com',
] as const;
```

If the value is universal invalid type data, use the existing util arrays:

```typescript
import { INVALID_STRING_VALUES } from '../../../test-data/static/util/invalid-values';
```

### Preserve Intentional Inline Boundaries

Do not over-extract values that are meaningful only inside one test.

```typescript
const tooLongName = 'A'.repeat(256);
const payload = generateProduct(refs, { name: tooLongName });
```

Inline is acceptable when the value is a local boundary, an invalid-type case
that is clearer beside the assertion, or a one-off nonexistent ID for a single
404 test. If it appears in multiple files, extract it.

### Refactor Factory Defaults

Factory defaults must remain dynamic unless the API requires a fixed reference.
External references such as `brand_id`, `category_id`, and `product_image_id`
should be passed into the factory from setup, not invented inside it.

```typescript
const payload = generateProduct(refs, {
    is_rental: true,
});
```

Do not replace Faker-generated fields with repeated literal strings such as
`'Test Product'`, `'test@example.com'`, or `'password123'`.

---

## Phase 4: Update Consumers Safely

Use structural updates where possible:

- Replace imports before replacing usages.
- Prefer enum references over duplicated literals.
- Prefer existing factory functions over creating parallel helpers.
- Keep relative import style consistent with neighboring files.
- Preserve test tags, `test.step()` structure, and schema validation patterns.
- If a value change affects API behavior, update schemas only from the documented
  contract. Runtime mismatches are bugs, not reasons to loosen schemas.

After editing, re-run `rg` for the old key and old literal:

```bash
rg "old literal"
rg "OLD_ENUM_KEY"
```

Zero matches is not always required for docs or migration notes, but every
remaining match must be intentional.

---

## Phase 5: Verification

Run the smallest useful verification set, expanding if the refactor touches
shared files.

```bash
npx tsc --noEmit
npx eslint .
npx playwright test tests/{area}/path/to/affected.spec.ts
```

If the project uses npm scripts for these checks, prefer the existing scripts.
If any affected Playwright test fails, load the `debugging` skill and fix the
failure. Do not suppress expectations, increase timeouts, or remove coverage.

Before reporting complete, confirm:

- The value now lives in the correct source-of-truth folder.
- All consumers import/use the source of truth.
- No forbidden hardcoded values were introduced.
- Static data remains `.ts` with `as const`.
- Factories still produce dynamic happy-path data.
- API response validation still uses
  `expect(SchemaName.parse(body)).toBeTruthy();`.
- Spec files still import `test` and `expect` from
  `fixtures/pom/test-options.ts`.
- Affected checks were run or any inability to run them is reported.

---

## Anti-Patterns

```typescript
// Bad: endpoint literal in a spec
await apiRequest({ method: 'GET', url: '/products', baseUrl: process.env.API_URL });

// Bad: repeated visible message in a page object or test
await expect(page.getByText('Successfully logged in')).toBeVisible();

// Bad: static happy-path data replacing Faker-generated values
const payload = { name: 'Test Product', email: 'test@example.com' };

// Bad: JSON static data
// test-data/static/app/invalidCredentials.json

// Bad: old and new sources of truth coexisting
export enum ApiEndpoints {
    PRODUCTS = '/products',
}
export const PRODUCTS_ENDPOINT = '/products';
```

---

## Related Skills

- `data-strategy` — choosing factory vs static TS vs inline boundary values
- `enums` — enum organization and usage conventions
- `api-testing` — API schemas, status coverage, and validation patterns
- `test-standards` — spec imports, tags, steps, and assertions
- `debugging` — required when affected tests fail after the refactor
