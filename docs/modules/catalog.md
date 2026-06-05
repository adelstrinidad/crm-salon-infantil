# Catalog Modules (Master Data)

This document describes the five catalog/master-data entities in crm-salon-infantil: **Clients**, **Services**, **Providers** (Prestadores), **Suppliers** (Proveedores), and **Event Types**. These modules hold the venue's reference data and form the foundation for event creation.

---

## Overview: Role in Event Building

| Entity | Purpose | Feeds into Events | Code File |
|--------|---------|-------------------|-----------|
| **Client** (Cliente) | Event organizer; contact record | Event's client/organizer | `lib/clients/clientService.ts` |
| **Service** (Servicio) | Catalog item with cost/price (e.g., DJ, catering) | Event's service list; drives cost/price | `lib/services/serviceService.ts` |
| **Provider** (Prestador) | Staff/personnel assignable per-event (e.g., DJ, animator) | Event's staff assignments; per-event cost | `lib/providers/providerService.ts` |
| **Supplier** (Proveedor) | External vendor supplying services (e.g., cake supplier) | Service's supplier link; tracked for payments | `lib/proveedores/proveedorService.ts` |
| **Event Type** (Tipo de evento) | Classification label (e.g., "Cumpleaños") | Event's type field | `lib/eventTypes/eventTypeService.ts` |

---

## 1. Clients (Clientes)

### Purpose
Clients are the party organizers: the people who book events and whose contact information is recorded for invoices and communication.

### Data Model

```prisma
model Client {
  id        String   @id @default(cuid())
  name      String
  dni       String?         // National ID
  phone     String?
  email     String?
  address   String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  events    Event[]         // one client → many events
}
```

**Schema** (`lib/clients/schema.ts`): validates `name` (required), `dni`, `phone`, `email`, `address`, `notes` (all optional).

### How It Feeds Events
- When creating an event, staff select or create a client inline (see `components/clientes/ClientCombobox.tsx`).
- Event records the `clientId` and `clientName` (denormalized for display if client is deleted).

### CRUD Flow

| Operation | Endpoint | Details |
|-----------|----------|---------|
| **List** | `GET /clientes` | `page.tsx`: calls `listClients()`, orders by name |
| **Get** | `lib/clients/clientService.ts:getClient(id)` | Fetch single record; `getClientWithEvents(id)` includes related events |
| **Create** | `POST /clientes/nuevo` → `createClientAction()` | Form: `ClientForm.tsx` → Server Action validates & creates |
| **Edit** | `GET /clientes/[id]/editar` + `updateClientAction()` | Fetch client, show form with prefilled values, update |
| **Delete** | `DeleteClientButton` → `deleteClientAction()` | Confirmation dialog; deletes if no referential constraint |

**Validation** (`lib/clients/schema.ts`):
- `name`: required, min 1 char
- `email`: optional; if present, must be valid email
- All others: optional strings

**Server Actions** (`app/(dashboard)/clientes/actions.ts`):
- `createClientAction()`: parse → create → `revalidatePath("/clientes")`
- `updateClientAction()`: parse → update → revalidate
- `deleteClientAction()`: delete → revalidate
- `quickCreateClientAction()`: returns `{ ok: true; client: { id, name } }` for inline creation in event forms

**No pagination** on client list (currently simpler UX).

### Edge Cases
- **Delete Protection**: None in the code currently. If a client is deleted and events reference `clientId`, those events become orphaned (but `clientName` is denormalized, so display still works).
- **Uniqueness**: No unique constraint on name or email — duplicates are possible.
- **Inline Creation**: Event forms can create clients on the fly via `quickCreateClientAction()`.

---

## 2. Services (Servicios)

### Purpose
Services are the catalog of offerings available at the venue: DJ, catering, decoration, entertainment, etc. Each service has a **cost** (what the venue pays the supplier/staff) and **price** (what the client is charged). Services drive the event's financial summary.

### Data Model

```prisma
model Service {
  id           String   @id @default(cuid())
  name         String
  description  String?
  cost         Int      @default(0)        // venue's cost, in cents
  price        Int      @default(0)        // client's price, in cents
  proveedorId  String?                     // optional link to a Supplier
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  proveedor    Proveedor?                  // foreign key relation
  events       EventService[]              // many ↔ many with Event
  bonificados  EventBonificado[]           // waived copies
}
```

**Money**: all costs/prices stored as integer cents. Form inputs (pesos string) → `parsePesosToCents()` → stored. Display: `formatMoney(cents)` → "$X.XXX,XX" (Argentine locale).

**Schema** (`lib/services/schema.ts`):
- `name`: required
- `description`: optional
- `cost`, `price`: string input → parsed via `parsePesosToCents()`
- `proveedorId`: optional; links to a Supplier

### How It Feeds Events
- Event form has a **Service Picker** (`EventServicePicker.tsx`): staff select services to include.
- Each selected service creates an `EventService` join record with `qty` (default 1).
- Event financial summary (`lib/events/financials.ts`) sums all `service.price * qty` for total revenue and `service.cost * qty` for total cost.
- If a service is marked as "bonificado" (complimentary/waived), it creates an `EventBonificado` record instead, which reduces the net price.

### CRUD Flow

| Operation | Endpoint | Details |
|-----------|----------|---------|
| **List** | `GET /servicios` | `page.tsx`: calls `listServices()`, includes related `proveedor`, orders by name |
| **Get** | `lib/services/serviceService.ts:getService(id)` | Fetch with `proveedor` relation |
| **Create** | `POST /servicios/nuevo` → `createServiceAction()` | Form: `ServiceForm.tsx` (see below) |
| **Edit** | `GET /servicios/[id]/editar` → `updateServiceAction()` | Prefill via `centsToPesos()` conversion |
| **Delete** | `DeleteServiceButton` → `deleteServiceAction()` | Deletes; cascade behavior via Prisma `onDelete: Cascade` on `EventService` |

**Form** (`components/servicios/ServiceForm.tsx`):
- Inputs: `name`, `description`, `cost`, `price` (number inputs; step 0.01), `proveedorId` (native select of suppliers)
- Cost/price displayed in pesos; form handler converts to cents before passing to Server Action
- Prefill on edit via `defaultValues` with `centsToPesos(service.cost)`, etc.

**Validation** (`lib/services/schema.ts`):
- Two-step schema:
  1. `serviceFormInputSchema`: parses form inputs (strings for cost/price)
  2. `serviceSchema`: transforms, converts cost/price to cents via `parsePesosToCents()`
- Type: `ServiceFormValues` = output of `serviceSchema` (cents)

**Server Actions** (`app/(dashboard)/servicios/actions.ts`):
- `createServiceAction()`, `updateServiceAction()`, `deleteServiceAction()`
- All parse via `serviceSchema`, check success, delegate to `lib/services/serviceService`, then `revalidatePath("/servicios")`

**No pagination** (currently all services shown on one page).

### Edge Cases
- **Delete with Cascade**: If a service is linked to events via `EventService`, the `onDelete: Cascade` on the join table removes those associations automatically. The event's financial summary recomputes without that service.
- **Bonificado (waived) services**: A service can appear in `EventBonificado` (complimentary) separately from `EventService` (paid). Both can coexist.
- **Supplier Link**: A service can optionally link to a Supplier (`Proveedor`) via `proveedorId`. This is for tracking which external vendor supplies the service (e.g., "Catering" → "José's Catering Co."). It does **not** automatically create payments; that is tracked separately in `Movement` records.
- **No uniqueness on name**: Multiple services can have the same name.

---

## 3. Providers / Staff (Prestadores)

### Purpose
Providers are internal staff or contractors assigned per-event (e.g., DJ, animator, photographer). Each has a **per-event cost** (what the venue pays them), and they are assigned individually to events as needed.

**Key distinction from Suppliers**: Providers are **internal personnel** assigned to specific events. Suppliers are **external vendors** that supply services or goods.

### Data Model

```prisma
model Provider {
  id        String   @id @default(cuid())
  name      String
  role      String?                 // e.g. "DJ", "Fotógrafo", "Animador"
  cost      Int      @default(0)    // per-event cost, in cents
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  events    EventProvider[]         // many ↔ many with Event
}
```

**Cost**: per-event flat fee, stored in cents. When a provider is assigned to an event, that event's total cost increases by this amount.

**Schema** (`lib/providers/schema.ts`):
- `name`: required
- `role`: optional (e.g., "DJ", "Fotógrafo")
- `cost`: string input → parsed via `parsePesosToCents()`

### How It Feeds Events
- Event form has a **Provider Picker** (`EventProviderPicker.tsx`): staff select which providers are assigned to the event.
- Each selected provider creates an `EventProvider` join record.
- Event financial summary includes the cost of each assigned provider.
- `EventProvider` also tracks payment state (`paid` boolean, `paidAt` timestamp) for the staff-payment module.

### CRUD Flow

| Operation | Endpoint | Details |
|-----------|----------|---------|
| **List** | `GET /prestadores` | `page.tsx`: calls `listProviders()`, orders by name |
| **Get** | `lib/providers/providerService.ts:getProvider(id)` | Fetch single record |
| **Create** | `POST /prestadores/nuevo` → `createProviderAction()` | Form: `ProviderForm.tsx` |
| **Edit** | `GET /prestadores/[id]/editar` → `updateProviderAction()` | Prefill via `centsToPesos()` |
| **Delete** | `DeleteProviderButton` → `deleteProviderAction()` | Deletes; cascade on `EventProvider` join |

**Form** (`components/prestadores/ProviderForm.tsx`): inputs for `name`, `role` (text), `cost` (number, step 0.01).

**Validation** (`lib/providers/schema.ts`):
- Same two-step pattern as Services: form input → `providerSchema.transform()` → cents conversion.

**Server Actions** (`app/(dashboard)/prestadores/actions.ts`): standard CRUD, revalidate on each operation.

### Edge Cases
- **Delete with Cascade**: If a provider is assigned to events via `EventProvider`, cascade removes those assignments and reduces event costs.
- **Payment Tracking**: `EventProvider.paid` and `paidAt` are used by the staff-payment module (`app/(dashboard)/pagos/prestadores/`) to track which providers have been paid for a given event.
- **No uniqueness on name**: Duplicate names are allowed.

---

## 4. Suppliers (Proveedores)

### Purpose
Suppliers are **external vendors** that supply goods or services (e.g., cake supplier, decoration company, equipment rental). They are **not** assigned per-event like Providers; instead, Services are linked to Suppliers to track sourcing.

**Key distinction from Providers**: Suppliers are **external, non-personnel vendors**. Providers are **internal/contractual staff**.

### Data Model

```prisma
model Proveedor {
  id          String   @id @default(cuid())
  name        String
  description String?
  phone       String?
  email       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  services    Service[]              // many ↔ many: one supplier → many services
}
```

**Note**: No cost field on Supplier. Services linked to a supplier have their own cost/price.

**Schema** (`lib/proveedores/schema.ts`):
- `name`: required
- `description`: optional
- `phone`: optional
- `email`: optional; if present, must be valid

### How It Feeds Events
- Services can optionally link to a Supplier via `Service.proveedorId`.
- When displaying an event's services, staff see which supplier each service comes from (informational).
- The supplier link is primarily for vendor management and potential supplier-payment tracking (roadmap: `app/(dashboard)/pagos/proveedores/` for supplier invoicing).

### CRUD Flow

| Operation | Endpoint | Details |
|-----------|----------|---------|
| **List** | `GET /proveedores` | `page.tsx`: calls `listProveedores()`, orders by name |
| **Get** | `lib/proveedores/proveedorService.ts:getProveedor(id)` | Fetch single record (can return null) |
| **Create** | `POST /proveedores/nuevo` → `createProveedorAction()` | Form: `ProveedorForm.tsx` |
| **Edit** | `GET /proveedores/[id]/editar` → `updateProveedorAction()` | Prefill values |
| **Delete** | `DeleteProveedorButton` → `deleteProveedorAction()` | Deletes (Prisma cascade if any services reference it) |

**Form** (`components/proveedores/ProveedorForm.tsx`): inputs for `name`, `description`, `phone`, `email`.

**Validation** (`lib/proveedores/schema.ts`):
- `name`: required, min 1 char
- `email`: optional; if present, valid email format

**Server Actions** (`app/(dashboard)/proveedores/actions.ts`): standard CRUD.

### Edge Cases
- **Delete with Cascade**: If a supplier is deleted and services reference it, Prisma cascades. The services' `proveedorId` becomes null.
- **Null Supplier**: Services can have `proveedorId: null` (no supplier specified).
- **No unique constraints** on name or email.

---

## 5. Event Types (Tipos de evento)

### Purpose
Event Types are simple classification labels for events (e.g., "Cumpleaños", "Bautismo", "Baby Shower", "Fiesta de 15"). They help organize and filter events.

### Data Model

```prisma
model EventType {
  id        String   @id @default(cuid())
  name      String   @unique           // unique constraint
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Uniqueness**: `name` has a unique constraint (no duplicate event types).

**Schema** (`lib/eventTypes/schema.ts`):
- `name`: required, min 1 char

### How It Feeds Events
- Event form has a field `eventType` (a string) that typically references an Event Type name or ID.
- This is more of a classification/tag than a foreign key link; it's stored as text on the `Event` model.

### CRUD Flow

| Operation | Endpoint | Details |
|-----------|----------|---------|
| **List** | `GET /tipos-evento` | `page.tsx`: calls `listEventTypes()`, orders by name |
| **Get** | `lib/eventTypes/eventTypeService.ts:getEventType(id)` | Fetch single record; throws if not found |
| **Create** | `POST /tipos-evento/nuevo` → `createEventTypeAction()` | Form with just a name input |
| **Edit** | `GET /tipos-evento/[id]/editar` → `updateEventTypeAction()` | Simple form |
| **Delete** | `DeleteEventTypeButton` → `deleteEventTypeAction()` | Deletes; no cascade (event types are not FK'd) |

**Form** (simple): single text input for `name`.

**Validation** (`lib/eventTypes/schema.ts`):
- `name`: required, min 1 char; unique at DB level

**Server Actions** (`app/(dashboard)/tipos-evento/actions.ts`): standard CRUD, revalidate on each operation.

### Edge Cases
- **Unique Constraint**: Attempting to create a type with a duplicate name will fail at the database level.
- **No Soft Delete**: Event types are hard-deleted. Events that reference a deleted type retain their `eventType` string (no foreign key, just a string field).

---

## Pagination Pattern

Services use the standard pagination pattern via `lib/pagination.ts`:

**Functions**:
```typescript
function parsePage(value: string | undefined, pageSize?: number): PageParams
// Parses ?page query param, defaults to page 1, returns { page, pageSize, skip, take }

function buildPaginated<T>(rows: T[], total: number, params: PageParams): Paginated<T>
// Wraps rows + metadata; returns { rows, total, page, pageSize, pageCount }
```

**Constants**:
- `DEFAULT_PAGE_SIZE = 20`

**Client List**: Currently **no pagination** (simple list shown in full).

**Service List**: Currently **no pagination** (all shown on one page).

All others (Providers, Suppliers, Event Types): **no pagination** (assumed small lists).

---

## Common Patterns

### Money Handling

All catalog entities that store money (Services cost/price, Providers cost) follow the **cents convention**:

```typescript
// lib/money.ts
function parsePesosToCents(value: string | undefined | null): number
// Form input (pesos string) → integer cents, e.g., "150.50" → 15050

function centsToPesos(cents: number): number
// Stored cents → pesos decimal, e.g., 15050 → 150.5

function formatMoney(cents: number): string
// Display: cents → locale-formatted string, e.g., 15050 → "$15.500,5" (es-AR)
```

**In Forms**: inputs use `type="number" step="0.01"` for pesos; form handler passes string to Server Action, which validates & converts via schema transform.

**In Display**: table cells show `formatMoney(cents)` for Argentine peso formatting.

### Authorization & Session

All Server Actions require `await requireSession()` (see `lib/auth/session.ts`). This checks session/cookie-based login. If session is missing, the action fails. No role-based checks yet (all authenticated staff have full CRUD).

### Revalidation

Each mutation (create/update/delete) calls `revalidatePath("/resource")` to clear Next.js cache and refresh the list view.

---

## Table: Entity → File Mapping

| Entity | Service File | Schema File | Page | Actions |
|--------|--------------|-------------|------|---------|
| **Client** | `lib/clients/clientService.ts` | `lib/clients/schema.ts` | `app/(dashboard)/clientes/page.tsx` | `app/(dashboard)/clientes/actions.ts` |
| **Service** | `lib/services/serviceService.ts` | `lib/services/schema.ts` | `app/(dashboard)/servicios/page.tsx` | `app/(dashboard)/servicios/actions.ts` |
| **Provider** (Prestador) | `lib/providers/providerService.ts` | `lib/providers/schema.ts` | `app/(dashboard)/prestadores/page.tsx` | `app/(dashboard)/prestadores/actions.ts` |
| **Supplier** (Proveedor) | `lib/proveedores/proveedorService.ts` | `lib/proveedores/schema.ts` | `app/(dashboard)/proveedores/page.tsx` | `app/(dashboard)/proveedores/actions.ts` |
| **Event Type** | `lib/eventTypes/eventTypeService.ts` | `lib/eventTypes/schema.ts` | `app/(dashboard)/tipos-evento/page.tsx` | `app/(dashboard)/tipos-evento/actions.ts` |

---

## Summary

The **Catalog modules** provide a clean separation of master data. Each entity is managed independently with its own CRUD operations, validation, and Server Actions. They are composed into Events via:

- **Clients**: own the event; one client → many events
- **Services**: define revenue/cost; selected per-event; drive financial summary
- **Providers**: internal staff; assigned per-event; flat cost per person
- **Suppliers**: external vendors; linked to services for sourcing/payments (roadmap)
- **Event Types**: simple classification labels for events

All money is in integer cents. Deletion cascades are handled by Prisma (`onDelete: Cascade` on join tables). No pagination yet (small venue scale). Auth via session; no role-based access control yet.
