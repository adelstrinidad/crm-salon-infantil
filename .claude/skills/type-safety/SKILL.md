---
name: type-safety
description: >
  Teaches how to define and use Zod schemas for API response validation and
  factory typing. Use when the task involves schema creation, response parsing,
  type inference, or fixing any-type violations in test code.
---

# Type Safety Skill

## Context

Zero `any` types allowed. API response and request contracts are represented by
Zod strict schemas. Factories validate generated payloads against request
schemas. TypeScript strict mode is on.

The repo uses `zod/v4` — always import from `zod/v4`, never from `zod`.

This skill owns schema and type mechanics. API status coverage belongs to
`api-testing`, factory placement belongs to `data-strategy`, and spec structure
belongs to `test-standards`.

---

## Recipe

### Schema Patterns

```typescript
// fixtures/api/schemas/{area}/[name]Schema.ts

import { z } from 'zod/v4';
import type { output as zOutput } from 'zod/v4';

// ✅ ALWAYS z.strictObject() — never z.object()
// z.strictObject() throws if response has unknown fields → catches API drift
export const ProductSchema = z.strictObject({
  id: z.number().int(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  category_id: z.number().int(),
  in_stock: z.boolean(),
  created_at: z.string(),
});

// Paginated wrapper (reusable generic)
export const createPaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.strictObject({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    current_page: z.number().int().positive(),
    last_page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    from: z.number().int().nullable(),
    to: z.number().int().nullable(),
  });

export const PaginatedProductSchema = createPaginatedSchema(ProductSchema);

// Export inferred types — never define types manually alongside schemas
export type Product = zOutput<typeof ProductSchema>;
export type PaginatedProduct = zOutput<typeof PaginatedProductSchema>;
```

### Shared error schemas (already in repo)

```typescript
// fixtures/api/schemas/util/errorResponseSchema.ts — already exists, import from here

import {
  BadRequestResponseSchema,
  UnauthorizedResponseSchema,
  NotFoundResponseSchema,
  MethodNotAllowedResponseSchema,
} from '../../../fixtures/api/schemas/util/errorResponseSchema';
```

Never redefine error schemas inline — always import from `errorResponseSchema.ts`.

### Using Schemas in Tests

```typescript
// ✅ Exact validation pattern required by CLAUDE.md
expect(ProductSchema.parse(body)).toBeTruthy();

// ✅ With type assertion for body extraction
const { status, body } = await apiRequest<Product>({
  method: 'GET',
  url: `${ApiEndpoints.PRODUCTS}/${id}`,
  baseUrl: process.env.API_URL,
});
expect(status).toBe(200);
expect(ProductSchema.parse(body)).toBeTruthy();

// ✅ Paginated
const { status, body } = await apiRequest<PaginatedProduct>({ ... });
expect(status).toBe(200);
expect(PaginatedProductSchema.parse(body)).toBeTruthy();
```

### Factory Types

```typescript
// test-data/factories/{area}/[name].factory.ts
import {
    ProductRequest,
    ProductRequestSchema,
} from '../../../fixtures/api/schemas/app/productSchema';

export const generateProduct = (
    overrides?: Partial<ProductRequest>
): ProductRequest => {
    return ProductRequestSchema.parse({
        name: faker.commerce.productName(),
        ...overrides,
    });
};
```

---

## Anti-Patterns (NEVER)

```typescript
// ❌ Wrong zod import
import { z } from 'zod';

// ❌ Loose schema
const schema = z.object({ id: z.number() });  // use z.strictObject()

// ❌ any type
const body: any = await response.json();

// ❌ Manual type definition alongside schema
type Product = { id: number; name: string };  // derive from schema instead

// ❌ Bare schema parse — insufficient
ProductSchema.parse(body);  // must be: expect(ProductSchema.parse(body)).toBeTruthy()

// ❌ Type generic without schema validation
const body = response.body as Product;  // no runtime validation
```

---

## Where Things Live

| Asset | Location |
|---|---|
| Entity schemas | `fixtures/api/schemas/{area}/[name]Schema.ts` |
| Shared error schemas | `fixtures/api/schemas/util/errorResponseSchema.ts` |
| Exported types | Same file as schema (bottom, `export type X = zOutput<typeof XSchema>`) |
| Factory input types | Derived from schema in `test-data/factories/{area}/[name].factory.ts` |

---

## Related Skills
- `api-testing` — where schemas are consumed
- `data-strategy` — Faker factories typed with schema output types
