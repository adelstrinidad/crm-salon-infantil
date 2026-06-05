# crm-salon-infantil Backend (Server-Side) Constitution

**Purpose**: Self-contained guide for the server-side of the app — data access, Server Actions, Route Handlers, and patterns. The backend is **not** a separate service; it lives inside the single Next.js app.

> Greenfield, beginner-friendly stack. Optimized for learning: minimal moving parts, type-safe end to end.

---

## I. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime / Framework** | Next.js (App Router) | 16.x | Hosts server logic (Server Actions + Route Handlers) |
| **Language** | TypeScript | 5.x | Strict mode, shared FE/BE types |
| **Server logic** | Server Actions + Route Handlers | - | Mutations and endpoints, no standalone API |
| **Validation** | Zod | 4.x | Validate inputs to actions/handlers |
| **Data Access** | Prisma ORM | 7.x | Type-safe queries + migrations (generated client at `app/generated/prisma`) |
| **Database (dev)** | SQLite | - | Zero-setup local file DB (`prisma/dev.db`) |
| **Database (later)** | PostgreSQL | - | Production target; swap Prisma `provider` only |
| **Auth** | Auth.js (NextAuth) | - | Session/cookie login (add when needed) |
| **Testing** | Vitest | - | Unit tests for `lib/` domain logic |

<!-- manual additions start -->
<!-- manual additions end -->

---

## II. Commands

### Prerequisites
- Node.js 20+ and npm
- No database server needed (SQLite is a file)

### Common

```bash
# Install deps
npm install

# Run dev server (UI + server logic)
npm run dev

# Prisma: edit schema, then create/apply a migration
npx prisma migrate dev --name <change>

# Prisma: regenerate client after schema change
npx prisma generate

# Prisma: open a GUI to inspect data
npx prisma studio

# Seed the database
npx prisma db seed

# Run server-side unit tests
npm run test
```

---

## III. Code Structure

```
crm-salon-infantil/
├── app/                          # Next.js App Router (UI + server)
│   ├── (dashboard)/              # Staff dashboard route group
│   │   ├── eventos/
│   │   │   ├── page.tsx          # Server Component (list)
│   │   │   └── actions.ts        # Server Actions (create/update event)
│   │   └── ...
│   └── api/                      # Route Handlers (when an HTTP endpoint is needed)
│       └── <resource>/route.ts
├── lib/                          # Domain + data logic (plain TS, testable)
│   ├── prisma.ts                 # Singleton Prisma client
│   ├── events/                   # Implemented: event queries + financial summary
│   ├── clients/
│   ├── services/                 # Service catalog (cost/price)
│   ├── providers/                # Prestadores / staff
│   ├── finance/                  # Accounts, balance
│   ├── movements/                # Movements (Ingreso/Egreso/Transferencia/Arqueo/Inversión/Retiros)
│   └── validations/              # Zod schemas (shared by actions/handlers)
├── prisma/
│   ├── schema.prisma             # Models + datasource (sqlite in dev)
│   ├── migrations/
│   ├── seed.ts
│   └── dev.db                    # SQLite file (gitignored)
└── tests/                        # Vitest tests for lib/
```

Roadmap domains (add later): `invitations/`, `inventory/`, `furniture/`, `sales/`.

---

## IV. Server Logic Design

- **Default to Server Actions** for form submissions and mutations (create/update/delete event, movement, etc.). Simpler than building REST endpoints.
- **Use Route Handlers (`app/api/.../route.ts`)** only when you need a real HTTP endpoint: called by client-side fetch, webhooks, or external consumers.
- **Keep business logic in `lib/<domain>`**, not in `page.tsx` or `actions.ts`. Actions/handlers are thin: validate input (Zod) → call `lib` → return result.
- **Read data in Server Components** directly via `lib/` functions; avoid client fetch for initial render.

---

## V. Data Access

- **One Prisma client**: import the singleton from `lib/prisma.ts` (avoids exhausting connections in dev hot-reload).
- **Queries live in `lib/<domain>`**, returning typed results; do not call Prisma directly from UI components.
- **Event is the central aggregate**: its financial summary (costo, ganancia, subtotal, precio total) is computed in `lib/events` from linked services, providers, and bonificados.
- **Migrations**: every schema change goes through `prisma migrate dev`. Never hand-edit the SQLite file.
- **DB portability**: keep queries Prisma-only (no raw SQL) so the SQLite → PostgreSQL switch stays a one-line `datasource` change.

---

## VI. Security

- **NEVER** commit secrets; `DATABASE_URL` and keys live in `.env` (gitignored).
- **Validate all external input** with Zod at the action/handler boundary before it reaches `lib/`.
- **Authorize inside Server Actions / Route Handlers** — never trust the client to hide a button; check the session/role server-side.
- Handle client/guest PII with care; log without exposing it.

---

## VII. Error Handling

- Validate first; return typed error results from Server Actions (e.g. `{ ok: false, errors }`) so the form can show field messages.
- Let unexpected errors throw; Next.js `error.tsx` boundaries catch them. Log server-side with context, never log secrets/PII.

---

## VIII. Testing

**Tests are part of the feature, written before push** — see Constitution §4.1
(Definition of Done). New calc → unit test; new service/query → integration test.

### Two layers (vitest projects, configured in `vitest.config.ts`)

- **`unit`** — pure functions & Zod schemas, no DB. Files: `lib/**/*.test.ts`,
  `tests/unit/**`. Run `npm run test:unit`. Put the calc helper next to its test
  (e.g. `lib/finanzas/balance.ts` + `balance.test.ts`). Keep calculations as pure
  functions so they're unit-testable apart from Prisma — extract math out of
  service functions rather than burying it in a DB query.
- **`integration`** — `lib/*Service.ts` against a real migrated SQLite test DB.
  Files: `tests/integration/**`. Run `npm run test:integration`.
  - Harness: `tests/integration/setup/globalSetup.ts` provisions a fresh
    `prisma/test.db` via `prisma migrate deploy` (also smoke-tests migrations);
    the integration project sets `DATABASE_URL=file:./prisma/test.db` — **never** dev.db.
  - `tests/integration/setup/db.ts` exports `resetDb()` (FK-safe truncation, call
    in `beforeEach`) and row factories (`makeAccount`, `makeEvent`, …, money in cents).
  - Watch timezones: `new Date("2026-06-01")` is UTC midnight and can fall *before*
    a local-time range start (GMT-3) — give dates a mid-day time in range-filter tests.

- `npm test` runs both projects; output MUST be pristine before pushing.
- **E2E (Playwright)** covers full user flows — see the frontend constitution.

---

## IX. Anti-Patterns (Avoid)

- Calling Prisma directly inside `page.tsx` / components instead of through `lib/`
- Fat Server Actions holding business logic instead of delegating to `lib/`
- Skipping Zod validation and trusting client input
- Authorization checks only on the client (hiding UI) without a server-side check
- Raw SQL that breaks the SQLite → PostgreSQL portability
- Adding a separate backend framework "just in case" — keep it single-app until a real need appears

---

**Related Documents**:
- [Architecture](./architecture.md) - System architecture and integration points
- [General Overview](./general-overview.md) - Project overview
- [Frontend Constitution](./constitution-frontend.md) - Frontend principles
