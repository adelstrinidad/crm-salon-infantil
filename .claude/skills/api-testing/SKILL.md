---
name: api-testing
description: >
  Teaches how to write Playwright API tests using the apiRequest fixture,
  Zod strict schemas, full status code matrix coverage, and the FIXME protocol
  for API behavior mismatches. Use when the task involves API test creation,
  schema validation, endpoint coverage, or fixing flaky API tests.
---

# API Testing Skill

## Context

API tests use the custom `apiRequest` fixture from `fixtures/pom/test-options.ts`.
Every response is validated with `expect(Schema.parse(body)).toBeTruthy()`.
Tests cover the full documented status-code matrix. Invalid field tests use
`for...of` loops with arrays from `test-data/static/util/invalid-values.ts`.

This skill owns API contracts, status-code coverage, `apiRequest` usage, and
behavior-mismatch handling. Spec-file tags/steps are owned by `test-standards`,
data placement by `data-strategy`, enum paths by `enums`, and schema mechanics
by `type-safety`.

---

## Critical

- In spec files, use the `apiRequest` fixture. Never use `page.request` or
  `playwright.request.newContext()`.
- Raw Playwright `request` is acceptable only inside fixture/helper internals
  that need the underlying request context. See `fixtures`.
- Source API contracts from OpenAPI/Swagger first. Runtime mismatches are bugs.
- Never loosen schemas, remove tests, or silently skip coverage because the API
  behaves differently from the documented contract.
- Every documented status code must have a passing test or a `test.skip` with
  `// FIXME:` and a clear reason.

---

## Phase 1: Source The Contract

```bash
# OpenAPI / Swagger is the default source of truth
cat documentation/openAPI.json

# Resolve real area folders before creating files
ls fixtures/api/schemas
ls test-data/factories
ls test-data/static
ls enums
```

If documentation is missing, capture the live response shape as a fallback and
flag the missing docs. Do not treat fallback exploration as permission to ignore
the intended contract.

---

## Phase 2: Define Or Reuse Schemas

```typescript
// fixtures/api/schemas/{area}/productSchema.ts
import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

export const ProductSchema = z.strictObject({
    id: z.string(),
    name: z.string(),
    price: z.number(),
});

export type Product = zOutput<typeof ProductSchema>;
```

Import shared error schemas from `fixtures/api/schemas/util/errorResponseSchema.ts`.
Never redefine common error response schemas inline.

---

## Phase 3: Build The Coverage Plan

Before writing code, enumerate every status code for endpoint x method.

```text
POST /products
- 201: create product with valid payload
- 401: missing token
- 403: wrong role
- 422: empty body
- 422: per-field omission loop
- 422: per-field invalid type loop
- 405: unsupported method
```

Include path parameter fuzzing for `/:id` endpoints: invalid formats, special
characters, and injection-like strings.

---

## Phase 4: Write API Tests

Use this shape as the canonical pattern:

```typescript
import { ApiEndpoints } from '../../../enums/app/app';
import { Product, ProductSchema } from '../../../fixtures/api/schemas/app/productSchema';
import { UnauthorizedResponseSchema } from '../../../fixtures/api/schemas/util/errorResponseSchema';
import { expect, test } from '../../../fixtures/pom/test-options';
import { generateProduct } from '../../../test-data/factories/app/product.factory';
import { INVALID_STRING_VALUES } from '../../../test-data/static/util/invalid-values';

test.describe('api/products', () => {
    test(
        'should return 201 when payload is valid',
        { tag: '@api' },
        async ({ apiRequest }) => {
            const payload = generateProduct(refs);

            const { status, body } = await apiRequest<Product>({
                method: 'POST',
                url: ApiEndpoints.PRODUCTS,
                baseUrl: process.env.API_URL,
                body: payload,
                headers: process.env.ACCESS_TOKEN,
            });

            expect(status).toBe(201);
            expect(ProductSchema.parse(body)).toBeTruthy();
        }
    );

    test(
        'should return 401 when auth header is missing',
        { tag: '@api' },
        async ({ apiRequest }) => {
            const { status, body } = await apiRequest({
                method: 'POST',
                url: ApiEndpoints.PRODUCTS,
                baseUrl: process.env.API_URL,
                body: generateProduct(refs),
            });

            expect(status).toBe(401);
            expect(UnauthorizedResponseSchema.parse(body)).toBeTruthy();
        }
    );

    for (const invalidValue of INVALID_STRING_VALUES) {
        test(
            `should return 422 when name is ${JSON.stringify(invalidValue)}`,
            { tag: '@api' },
            async ({ apiRequest }) => {
                const { status } = await apiRequest({
                    method: 'POST',
                    url: ApiEndpoints.PRODUCTS,
                    baseUrl: process.env.API_URL,
                    body: { ...generateProduct(refs), name: invalidValue },
                });

                expect(status).toBe(422);
            }
        );
    }
});
```

When a test has 2+ API calls, wrap each call in a named `test.step()` with
validation.

---

## Phase 5: Verify Status Code Coverage

| Method | Required coverage |
|---|---|
| GET /collection | 200, 404 if applicable, 405 |
| GET /:id | 200, 404, path-param fuzzing, 405 |
| POST /collection | 201, empty body, per-field omission, per-field invalid type, 401/403 if auth required, 405 |
| PUT/PATCH /:id | 200, 404, per-field validation, 401/403, 405 |
| DELETE /:id | 204, 401, 403, 404, 405, 409 if applicable |

Every documented status code must be accounted for before the test is complete.

---

## Phase 6: FIXME Protocol

When the API does not behave as the OpenAPI contract specifies:

```typescript
/* eslint-disable playwright/no-skipped-test */
// FIXME: API coerces stringified numbers and returns 200 instead of 422.
test.skip(
    'should return 422 when price is a numeric string',
    { tag: '@api' },
    async ({ apiRequest }) => {
        const { status } = await apiRequest({
            method: 'POST',
            url: ApiEndpoints.PRODUCTS,
            baseUrl: process.env.API_URL,
            body: { ...generateProduct(refs), price: '123' },
        });

        expect(status).toBe(422);
    }
);
```

Rules:

- Keep the test in place as a living bug report.
- Explain expected vs actual behavior.
- Link a ticket when one exists.
- Re-enable the test when the backend is fixed.

---

## Anti-Patterns

```typescript
// Bad: wrong import in a spec
import { test } from '@playwright/test';

// Bad: bare parse
ProductSchema.parse(body);

// Bad: type generic without runtime validation
const { body } = await apiRequest<Product>({ ... });

// Bad: only empty-body validation
test('should return 422 for empty body', async () => {});

// Bad: raw Playwright request in a spec
const response = await page.request.get('/products');
```

---

## Related Skills

- `type-safety` — Zod schema mechanics and `zod/v4` imports
- `fixtures` — when raw request context is allowed inside fixtures
- `data-strategy` — factories and invalid-value arrays
- `enums` — endpoint constants
- `test-standards` — tags, steps, and spec structure
