---
name: enums
description: >
  Teaches how to define, locate, and use enum source-of-truth files under
  enums/{area}/ and enums/util/. Use when adding or updating endpoint paths,
  UI routes, reusable UI messages, storage-state paths, roles, status values,
  error codes, or any repeated string literal that should not live in tests.
---

# Enums Skill

## Context

`CLAUDE.md` makes `enums/**` the source of truth for repeated strings that are
not test data:

- endpoint paths
- route paths
- reusable UI messages
- storage-state paths
- roles and shared app constants
- repeated status or error-code values

This skill owns where those values live and how they are consumed. If you are
changing an existing enum key/value, use `refactor-values` for impact analysis.
If the value is payload data or invalid test data, use `data-strategy` instead.

---

## Where Enums Live

```text
enums/
├── {area}/
│   └── [name].ts
└── util/
    └── [name].ts
```

Resolve `{area}` with `ls enums` before creating or importing files.

---

## Current Pattern

```typescript
// enums/app/app.ts

export enum Messages {
    LOGIN_SUCCESS = 'Successfully logged in',
    LOGIN_FAILED = 'Invalid credentials',
}

export enum Routes {
    CHECKOUT = '/checkout',
    PRODUCT = '/product',
}

export enum ApiEndpoints {
    LOGIN = '/users/login',
    PRODUCTS = '/products',
}

export enum StorageStatePaths {
    APP = '.auth/app/appStorageState.json',
    ADMIN_APP = '.auth/app/adminAppStorageState.json',
}
```

Shared utility enums live under `enums/util/`:

```typescript
// enums/util/roles.ts
export enum Roles {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
}
```

---

## Usage

```typescript
import { ApiEndpoints, Messages, Routes } from '../../../enums/app/app';
import { Roles } from '../../../enums/util/roles';

await page.goto(`${process.env.APP_URL}${Routes.CHECKOUT}`);
await expect(loginPage.successMessage).toContainText(Messages.LOGIN_SUCCESS);

const { status, body } = await apiRequest({
    method: 'GET',
    url: ApiEndpoints.PRODUCTS,
    baseUrl: process.env.API_URL,
    headers: process.env.ACCESS_TOKEN,
});

expect(user.role).toBe(Roles.USER);
```

---

## Rules

- Do not invent enum values. Confirm UI text with `playwright-cli` and endpoint
  paths with OpenAPI/Swagger.
- Do not put credentials, base URLs, or tokens in enums. Use `process.env.*`.
- Do not put payload data or invalid test cases in enums. Use `test-data/**`.
- Do not duplicate an enum value in another constants file.
- When renaming or changing an existing value, load `refactor-values` and update
  every consumer.

---

## Anti-Patterns

```typescript
// Bad: endpoint literal in a spec
await apiRequest({ method: 'GET', url: '/products', baseUrl: process.env.API_URL });

// Bad: reusable UI message literal in a test
await expect(page.getByText('Successfully logged in')).toBeVisible();

// Bad: credential in enum
export enum Users {
    PASSWORD = 'Password123!',
}

// Bad: test data in enum
export enum InvalidEmails {
    MISSING_AT = 'missing-at-sign.com',
}
```

---

## Related Skills

- `refactor-values` — safely changing existing enum keys or values
- `data-strategy` — factories and static test data
- `config` — environment variables and configuration
- `type-safety` — consuming enum values in schemas when needed
