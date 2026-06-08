# crm-salon-infantil System Architecture

**Target Audience**: All developers and architects
**Purpose**: System-level architecture, integration points, and cross-cutting concerns

---

## System Components Overview

**Single Next.js application** (App Router). There is no separate backend service — server logic lives inside the same Next.js app as Server Components, Server Actions, and Route Handlers. Chosen for simplicity and a single learning surface.

### Core Components

1. **UI Layer** (`app/`, `components/`) - Next.js App Router pages and React Server Components for staff dashboard (calendar, events, finance). Client Components (`"use client"`) only where interactivity is needed.
   - `Calendar & Events` - Calendar views, event list (Mis eventos / Presupuestados), event create/edit form.
   - `Finance` - Accounts, balance, movements, reports screens.

2. **Server Layer** (`app/**/actions.ts`, `app/api/**/route.ts`) - Server Actions handle form mutations (create/update event, movement, etc.); Route Handlers expose endpoints needed by client code or external callers. This replaces a standalone API.

3. **Domain / Data Logic** (`lib/`) - Plain TypeScript modules per domain (events, clients, services, providers, finance, movements) that wrap Prisma queries and business rules (e.g. event financial summary). Called by Server Actions and Route Handlers.

4. **Data Access** (`lib/prisma.ts`, `prisma/schema.prisma`) - Single Prisma client; schema + migrations.

5. **Database Layer** (`prisma/dev.db`) - SQLite for local/dev via Prisma ORM. Swappable to PostgreSQL later by changing the Prisma `datasource` provider + `DATABASE_URL`; query code is unchanged.

---

## Integration Architecture

### External Systems

| System | Protocol | Purpose |
|--------|----------|---------|
| **Payment / Charging gateway** | HTTPS | Process event charges/receipts (roadmap) |
| **Notifications (Email / WhatsApp)** | SMTP / HTTPS API | Booking and availability messages (roadmap) |
| **Shareable Invitation Links** | HTTPS (public links) | Distribute digital invitations and collect RSVPs (roadmap) |

### Data Flow

```
Browser (staff dashboard — Next.js pages / React Server Components)
    ↓ (Server Action call or fetch to Route Handler)
Server layer (Server Actions + Route Handlers, same Next.js app)
    ↓ (call domain modules in lib/)
Domain logic (lib/<domain>) → Prisma client
    ↓
SQLite (dev) / PostgreSQL (later)
```

---

## Data Architecture

### Relational Model

**Characteristics**:
- Normalized relational schema, managed by Prisma migrations (SQLite in dev).
- Core entities: **Event** (with state: Reservado/Señado/Pagado/Cerrado/Suspendido/Presupuestado/Día festivo), **EventType**, **Client**, **Service**, **Provider/Staff** (prestador), **EventService**, **EventProvider**, **Bonificado** (complimentary service line), **Account** (cuenta), **Movement** (categories: Ingreso/Egreso/Transferencia/Arqueo/Inversión/Retiros), **Payment** (supplier/staff). Roadmap entities: Invitation/Guest, InventoryItem, FurnitureItem, Sale.
- The **Event** is the central aggregate: it links event type, client, services, providers, complimentary lines, and derives the financial summary (costo total, ganancia, subtotal, precio total). **`Event.totalPrice` is a derived, persisted value (not user input): it equals the subtotal (service prices − bonificados) and is recomputed via `recomputeEventTotalPrice()` whenever an event's services or bonificados change. Providers/staff are costs only and never affect price.** Movements and payments post against accounts and may be linked or not linked to an event.

**Database**: SQLite (dev) via Prisma; migrate to PostgreSQL later with no query-code changes.

---

## Security Architecture

### System-Level Security
- Secrets (`DATABASE_URL`, future API keys) in `.env` files, never committed.
- Single-app auth: session/cookie-based login for staff (library TBD, e.g. Auth.js); role checks enforced inside Server Actions / Route Handlers.
- Public invitation links (roadmap) use unguessable tokens; no authenticated session required for guest RSVP.

### Security Rules
- **NEVER** store connection strings in code
- **NEVER** commit credentials to git
- Use environment-specific configuration files
- See `.ai/0_core_memory/security-rules.md` for full rules

---

**Related Documents**:
- [General Overview](./general-overview.md) - Project overview and context
- [Backend Constitution](./constitution-backend.md) - Backend tech stack, commands, patterns
- [Frontend Constitution](./constitution-frontend.md) - Frontend tech stack, commands, patterns
