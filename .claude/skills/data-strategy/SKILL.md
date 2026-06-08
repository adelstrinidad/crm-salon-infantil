---
name: data-strategy
description: >
  Teaches where test data belongs in this Playwright scaffold: Faker factories
  for dynamic happy-path payloads, test-data/static/util arrays for universal
  invalid types, test-data/static/{area} files for domain-specific invalid or
  boundary sets, and inline values only for one-test-only boundaries. Use when
  creating factories, static test data, data-driven tests, or removing
  hardcoded test content.
---

# Data Strategy Skill

## Context

`CLAUDE.md` defines the data sources of truth:

1. Dynamic happy-path data lives in `test-data/factories/{area}/`.
2. Universal invalid type arrays live in
   `test-data/static/util/invalid-values.ts`.
3. Domain-specific invalid or boundary sets live in
   `test-data/static/{area}/*.ts`.
4. One-test-only boundary values may stay inline in the spec.

This skill owns data placement and factory/static-data shape. Spec structure is
owned by `test-standards`; API coverage and validation are owned by
`api-testing`; enum values are owned by `enums`.

---

## Critical

- Never hardcode happy-path test content in specs.
- Never use `Math.random()` for test data. Use Faker through a factory.
- Never store static test data as JSON. Use `.ts` files with `as const` exports.
- Never invent externally constrained IDs. Fetch them in setup or pass them into
  the factory as references.
- Never move endpoint paths, route paths, UI messages, roles, or storage-state
  paths into test data. Those belong in `enums/**`.

---

## Where Data Lives

```text
test-data/
├── factories/
│   └── {area}/
│       └── [name].factory.ts
└── static/
    ├── util/
    │   └── invalid-values.ts
    └── {area}/
        └── [name].ts
```

Resolve `{area}` with `ls test-data/factories` and `ls test-data/static` before
creating or importing files.

---

## Factory Pattern

Factories generate valid happy-path payloads and validate their output against
the relevant request schema.

```typescript
// test-data/factories/{area}/product.factory.ts
import { faker } from '@faker-js/faker';
import {
    ProductRequest,
    ProductRequestSchema,
} from '../../../fixtures/api/schemas/app/productSchema';

export interface ProductFactoryRefs {
    brand_id: string;
    category_id: string;
    product_image_id: string;
}

export const generateProduct = (
    refs: ProductFactoryRefs,
    overrides?: Partial<ProductRequest>
): ProductRequest => {
    const defaults: ProductRequest = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price({ min: 1, max: 999, dec: 2 })),
        category_id: refs.category_id,
        brand_id: refs.brand_id,
        product_image_id: refs.product_image_id,
        is_location_offer: false,
        is_rental: false,
        co2_rating: faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E']),
    };

    return ProductRequestSchema.parse({ ...defaults, ...overrides });
};
```

Use overrides for scenario-specific values:

```typescript
const payload = generateProduct(refs, { is_rental: true });
```

---

## Static Data Pattern

Use static data for invalid and boundary sets that are intentionally curated and
reused by tests.

```typescript
// test-data/static/app/invalidCredentials.ts
export const INVALID_EMAILS = [
    '',
    'plaintext',
    'missing-at-sign.com',
] as const;

export const INVALID_LOGIN_ATTEMPTS = [
    {
        description: 'invalid email format with valid password',
        email: 'invalid-email',
        password: 'ValidPassword123!',
    },
] as const;
```

Universal type mismatch values should reuse the shared util arrays:

```typescript
import { INVALID_STRING_VALUES } from '../../../test-data/static/util/invalid-values';
```

---

## Inline Boundary Values

Keep a value inline only when it exists for one test and is clearer beside the
assertion.

```typescript
const tooLongName = 'A'.repeat(256);
const payload = generateProduct(refs, { name: tooLongName });
```

If the same invalid value or boundary appears in multiple files, move it to
`test-data/static/{area}/*.ts`.

---

## Decision Table

| Value type | Home |
|---|---|
| Valid random names, emails, payload fields | `test-data/factories/{area}/` |
| Valid payload with one scenario override | Factory call with `overrides` |
| Universal invalid type cases | `test-data/static/util/invalid-values.ts` |
| Domain-specific invalid credentials, malformed IDs, boundary sets | `test-data/static/{area}/*.ts` |
| One-test-only boundary | Inline in the spec |
| Endpoint, route, message, role, storage path | `enums/**` |
| URL, credential, token | `process.env.*` declared in `env/` |

---

## Anti-Patterns

```typescript
// Bad: hardcoded happy-path data in a spec
const payload = { name: 'Test Product', price: 29.99 };

// Bad: random data outside a factory
const email = `${Math.random()}@example.com`;

// Bad: static data in JSON
// test-data/static/app/invalidCredentials.json

// Bad: route or endpoint treated as test data
export const LOGIN_ENDPOINT = '/users/login';
```

---

## Related Skills

- `test-standards` — how data-driven tests are structured
- `api-testing` — how API tests consume factories/static arrays
- `type-safety` — schema-derived factory types
- `enums` — endpoint, route, message, role, and storage constants
- `refactor-values` — migrating existing hardcoded values safely
