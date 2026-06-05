# Auth, Reports, and Shared Modules

**Audience**: Maintainers, new developers learning the auth flow, report aggregation logic, and shared utilities.

**Purpose**: Document session/cookie authentication, password hashing, report service computation (income/expense, event financials, movement summaries), calendar rendering, and cross-cutting utilities (money conversion, Prisma singleton, TypeScript utilities).

---

## I. Authentication (Session / Cookie / Password)

### Overview

The app uses a **single-admin model** with **JWT-based sessions** stored in HTTP-only cookies. There is no multi-user auth database — credentials (email and hashed password) are stored in environment variables.

**Flow**:
1. User submits login form (email + password) → `loginAction` server action
2. `loginAction` verifies against `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (env vars)
3. On success, creates a signed JWT token and stores it in an HTTP-only cookie
4. Subsequent requests: `proxy.ts` verifies the token; if valid, request proceeds; if expired/invalid, redirects to `/login`
5. Logout deletes the session cookie

### Session Management

**File**: `lib/auth/session.ts`

#### `createSession()`
- **Line 8**: Generates a signed JWT with claim `authenticated: true`, expires in 7 days
- **Algorithm**: HS256 (HMAC SHA-256) with `AUTH_SECRET` env var as the key
- **Cookie attributes** (lines 16–22):
  - `httpOnly: true` — not accessible from JavaScript (XSS mitigation)
  - `secure: true` in production (HTTPS only)
  - `sameSite: "lax"` — CSRF protection
  - `maxAge: 604800` (7 days in seconds)
  - `path: "/"` — valid site-wide

#### `getSession()`
- **Line 30**: Retrieves the session cookie and verifies its JWT signature
- Returns `{ authenticated: boolean }` if valid, or `null` if missing/expired/tampered
- **Defense**: catch block silently returns `null` on verification failure (expired or invalid token)

#### `requireSession()`
- **Line 45**: Guard for Server Actions and Route Handlers
- Calls `getSession()`; if unauthenticated, redirects to `/login`
- Use inside any Server Action that mutates data (create/update/delete) or accesses protected routes

**Example**:
```typescript
// In a Server Action
export async function createEventAction(formData: FormData) {
  await requireSession(); // Redirects to /login if unauthenticated
  // Proceed with creating event...
}
```

### Password Hashing

**File**: `lib/auth/password.ts`

#### Design
- Uses **scrypt** (Node.js standard library, no extra dependency)
- Stores format: `"salt:hash"` (both hex-encoded)
- KEYLEN: 64 bytes
- Salt: 16 random bytes (per password)

#### `hashPassword(password: string): Promise<string>`
- **Line 10**: Generates a random salt (16 bytes)
- Derives a hash using scrypt with the salt
- Returns `"<salt_hex>:<hash_hex>"`
- Used **once** to generate `ADMIN_PASSWORD_HASH` env var (not on every login)

#### `verifyPassword(password: string, stored: string | undefined): Promise<boolean>`
- **Line 16**: Parses the stored `"salt:hash"` format
- Re-derives the hash from the provided password + stored salt
- **Line 25**: Uses `timingSafeEqual` to prevent timing attacks
- Returns `true` if hashes match, `false` otherwise

**Timing safety** (line 12, `lib/auth/actions.ts`):
```typescript
// Always run verification even on wrong email so response time doesn't leak email existence
const passwordOk = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);
```

### Password Setup

**File**: `scripts/hash-password.ts`

**Usage**:
```bash
npm run hash-password -- 'your-password'
# Output: salt_hex:hash_hex
# Paste the output into ADMIN_PASSWORD_HASH in .env
```

### Login Flow

**File**: `app/login/page.tsx` (Server Component) + `app/login/LoginForm.tsx` (Client Component)

1. **Page** (line 3): Renders a centered login form with title "Salón Infantil"
2. **Form** (line 11, `LoginForm.tsx`): Renders email + password inputs + submit button
3. **Submit** (line 13): Calls `loginAction` Server Action via `useActionState` hook
4. **Server Action** (`lib/auth/actions.ts`, line 7):
   - Extracts `email` and `password` from `FormData`
   - Compares `email` against `ADMIN_EMAIL` (line 11)
   - Calls `verifyPassword()` (line 14) regardless of email match
   - If both valid: calls `createSession()`, redirects to `/eventos` (line 21)
   - If either invalid: returns error message "Credenciales incorrectas" (line 17)
5. **Error display**: LoginForm renders the error from `useActionState` state (line 35)

### Route Protection

**File**: `proxy.ts` (Next.js 16 uses `proxy.ts`, not `middleware.ts`)

#### Design
- Runs on all requests before they reach the Next.js app
- Whitelist: `/login` is public (line 4)
- All other routes require a valid session cookie (line 14)

#### Logic
```typescript
export async function proxy(request: NextRequest) {
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next(); // Allow /login
  }
  
  const token = request.cookies.get("session")?.value;
  if (token) {
    try {
      await jwtVerify(token, secret); // Verify signature + expiration
      return NextResponse.next(); // Token valid, allow request
    } catch {
      // Fall through to redirect (expired or tampered)
    }
  }
  
  // No token or verification failed → redirect to /login
  return NextResponse.redirect(loginUrl);
}
```

#### Export
```typescript
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
```
- Matches all routes except static files, images, favicon, and `/api/*` (allows API access without session if needed)

---

## II. Reports Service

**File**: `lib/reports/reportsService.ts`

### Overview

Reports aggregate financial data across events (income, expenses, profit) and movements (independent transactions not tied to an event). All money is stored as **integer cents** (centavos).

### Report Types

#### 1. Event Grouped by Type (`getEventGroupedByType`)

**Purpose**: Summary table grouped by event type (e.g., "Cumpleaños", "Bautismo").

**Computation** (line 24):
- Filters events by date range and optional state
- For each event, computes financial summary via `computeEventFinancials()`
- Groups by `eventType` and sums:
  - `count`: number of events
  - `servicePrice`: total service income (prices)
  - `serviceCost`: total service costs
  - `providerCost`: total staff/provider costs
  - `totalBonificado`: total complimentary service deductions
  - `subtotal`: `servicePrice - totalBonificado` (what client pays)
  - `totalCost`: `serviceCost + providerCost`
  - `profit`: `subtotal - totalCost`

**Example output**:
```
eventType: "Cumpleaños"
count: 3
servicePrice: 1500000 (15000 pesos)
serviceCost: 500000
providerCost: 300000
totalBonificado: 100000
profit: 700000
```

#### 2. Per-Event Performance Report (`getEventPerformanceReport`)

**Purpose**: Detailed per-event breakdown (event name, client, date, state, financials).

**Returns** (line 61):
```typescript
{
  id, name, eventType, clientName, startAt, state, totalPrice,
  ...computeEventFinancials(event)
}
```

Used by the "Detalle por evento" table in `/reportes` page (line 171, `app/(dashboard)/reportes/page.tsx`).

#### 3. Balance Summary Cards (`getBalanceSummaryCards`)

**Purpose**: High-level financial overview (total income, expenses, investments, balance).

**Logic** (line 65):
- Fetches events + movements in date range
- Calculates:
  - `ingresosEventos`: sum of `subtotal` for all events
  - `egresosEventos`: sum of `totalCost` for all events
  - `otrosEgresos`: sum of `EGRESO` + `RETIRO` movements not linked to events
  - `inversiones`: sum of `INVERSION` movements
  - `balanceTotal`: `ingresosEventos - egresosEventos - otrosEgresos - inversiones`

**Display** (line 141, reportes page): Five cards showing each metric.

#### 4. Movement Summary (`getMovementSummary`)

**Purpose**: All movements (transactions) in a date range with type summaries.

**Returns** (line 100):
```typescript
{
  movements: Movement[], // All movements, including account details
  ...summarizeMovements(movements) // Totals by type
}
```

**Related**: `lib/finanzas/balance.ts` provides `summarizeMovements()`.

#### 5. Movements Without Event (`getMovementsWithoutEvent`)

**Purpose**: Independent transactions not tied to a specific event.

**Used by**: "Movimientos sin evento" section (line 223, reportes page).

### Shared Financial Computation

**File**: `lib/events/financials.ts` (imported line 4)

**Function**: `computeEventFinancials(event)` — takes a Prisma Event with included relations and returns:
```typescript
{
  servicePrice: number,      // Sum of service prices
  serviceCost: number,       // Sum of service costs
  providerCost: number,      // Sum of provider/staff costs
  totalBonificado: number,   // Sum of complimentary service deductions
  subtotal: number,          // servicePrice - totalBonificado
  totalCost: number,         // serviceCost + providerCost
  profit: number,            // subtotal - totalCost
}
```

**All values in integer cents** — see §III below for money conversion.

---

## III. Calendar Rendering

### Overview

Calendar displays events color-coded by state. Two implementations available:
1. **CalendarClient** (`components/calendario/CalendarClient.tsx`) — interactive react-big-calendar (month/week/day/agenda views)
2. **CalendarGrid** (`components/calendario/CalendarGrid.tsx`) — simple grid view (fallback or supplemental)

### Page Server Component

**File**: `app/(dashboard)/calendario/page.tsx`

**Logic** (line 1):
- Fetches all events in a ±1 month buffer around the target year (line 12)
- Passes raw event data to `CalendarClient` (line 18)
- Client component handles view switching and navigation

### CalendarClient (Interactive)

**File**: `components/calendario/CalendarClient.tsx`

#### State Colors & Text

**Line 25**: Maps event state to soft, accessible palette:
```typescript
const STATE_COLORS: Record<string, string> = {
  PRESUPUESTADO: "#ede9fe",   // Purple
  RESERVADO:     "#dbeafe",   // Blue
  SENADO:        "#fef3c7",   // Amber
  PAGADO:        "#d1fae5",   // Green
  CERRADO:       "#e7e5e4",   // Stone
  SUSPENDIDO:    "#ffe4e6",   // Rose
};
```

Matching text colors (line 34) ensure contrast.

#### Library

Uses **react-big-calendar** with **date-fns** localization (line 15):
- Locale: Spanish (es)
- Week starts Monday
- Formats: `MMMM yyyy` for header (line 130)

#### Interactions

- **View toggle** (line 84): Month, Week, Day, Agenda (Spanish translations in MESSAGES, line 45)
- **Mini-calendar picker** (line 126): Popover with shadcn/ui Calendar
- **Event click** (line 110): Navigates to `/eventos/{id}`
- **Month selector**: Highlights current month (line 130)

#### Styling

Line 99: Events styled via `eventPropGetter` callback — sets background, text color, border-radius, padding inline.

### CalendarGrid (Simple Grid)

**File**: `components/calendario/CalendarGrid.tsx`

Simple static grid view, not currently used by the main calendar page. Provides:
- Month/year navigation via query params (line 55)
- Event cells color-coded by state
- Same state color scheme as CalendarClient (via `statusBadgeClass()` utility)
- Today's date highlight (line 114)

---

## IV. Shared Utilities

### Money Conversion

**File**: `lib/money.ts`

All money is stored as **integer centavos** (cents) in the database to avoid floating-point rounding errors.

#### Conversion Functions

- **`pesosToCents(pesos: number): number`** (line 8)
  - Converts pesos (float) to cents: `Math.round(pesos * 100)`
  - E.g., `12.50` → `1250`

- **`parsePesosToCents(value: string | null): number`** (line 12)
  - Parses string input (from HTML) to cents
  - E.g., `"12.50"` → `1250`; `"invalid"` or `null` → `0`

- **`centsToPesos(cents: number): number`** (line 17)
  - Converts cents back to pesos: `cents / 100`
  - E.g., `1250` → `12.5`

- **`formatMoney(cents: number): string`** (line 22)
  - Formats cents as Argentine peso string
  - E.g., `1550050` → `"$15.500,5"` (locale: `es-AR`)
  - Uses `toLocaleString()` with 0–2 decimal places

**Usage**:
```typescript
// I/O boundary: incoming form
const pesos = parseFloat(formData.get("price")); // "15.50"
const cents = parsePesosToCents("15.50"); // 1550

// Business logic: always use cents
const total = serviceCost + providerCost; // Both in cents

// Output boundary: display
return formatMoney(total); // "$15.500,5"
```

**Related**: Reports page (line 18, `reportes/page.tsx`) imports `formatMoney` and uses it as `fmt()` shorthand throughout.

### Prisma ORM & Database

**File**: `lib/prisma.ts`

#### Singleton Pattern

**Purpose**: Avoid creating multiple Prisma clients in development (each hot-reload would exhaust connections).

**Implementation** (line 22):
```typescript
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma; // Reuse on hot-reload
}
```

#### Adapter Pattern (Prisma v7)

**Line 18**: Uses `PrismaLibSql` adapter
```typescript
const adapter = new PrismaLibSql({ url: resolveDbUrl() });
return new PrismaClient({ adapter });
```

**Important**: Config is passed as an object `{ url }`, not a pre-created client. This pattern is required for Prisma v7 with libsql adapter.

#### Database URL Resolution

**Line 7**: `resolveDbUrl()` handles multiple scenarios:
- Default: `file:dev.db` (SQLite in project root)
- Environment variable `DATABASE_URL`:
  - `file:` URLs: made absolute so different `cwd` doesn't break them
  - Remote URLs (e.g., PostgreSQL): passed through as-is
- **Example**: `DATABASE_URL="file:./data/my.db"` → becomes absolute path

#### Usage

**Every domain module imports**:
```typescript
import { prisma } from "@/lib/prisma";
```

**Typical queries**:
```typescript
const event = await prisma.event.findUnique({
  where: { id },
  include: { services: { include: { service: true } }, ... }
});
```

### Tailwind CSS Class Utilities

**File**: `lib/utils.ts`

#### `cn(...inputs: ClassValue[]): string`

Combines Tailwind class strings, resolving conflicts:
```typescript
import { cn } from "@/lib/utils";

// Example
cn(
  "p-4 bg-red-500",
  condition && "bg-blue-500", // Overwrites bg-red-500 if true
  responsive && "sm:p-8"
)
// Result: "p-4 bg-blue-500 sm:p-8" (if condition = true)
```

**Under the hood** (line 1):
- `clsx()`: conditionally includes classes
- `twMerge()`: resolves Tailwind conflicts (last wins)

**Used extensively** in reports page for coloring, spacing, and responsive classes.

---

## V. Event State & Schemas

**File**: `lib/events/schema.ts`

### Event States

Seven possible states (line 7):
- `PRESUPUESTADO`: Quoted (not yet sold)
- `RESERVADO`: Booked (no deposit)
- `SENADO`: Deposit paid
- `PAGADO`: Fully paid
- `CERRADO`: Closed/complete
- `SUSPENDIDO`: Suspended
- (Implicitly): `"DÍA FESTIVO"` (holiday) — stored as event type, not state

### Form Input Schema

**Line 19**: `eventFormInputSchema` — validates raw form submission (all strings):
```typescript
{
  name: string,
  eventType: string,
  clientName: string,
  clientId?: string,
  startAt: string (ISO date),
  endAt: string (ISO date),
  state: EventState,
  details?: string,
  notes?: string,
  totalPrice: string ("0" default)
}
```

### Server Schema

**Line 35**: `eventSchema` — transforms form input for storage:
```typescript
{
  ...data,
  startAt: Date,
  endAt: Date,
  totalPrice: number (in cents, via parsePesosToCents)
}
```

**Note** (line 1): `z.coerce.*` has type issues with RHF resolvers, so plain `z.string()` is used in form schema and transformed in server schema.

---

## Summary Table: Auth Boundaries

| Component | Function | Responsibility |
|-----------|----------|-----------------|
| `proxy.ts` | Guard (middleware-like) | Redirect unauthenticated requests to `/login` |
| `LoginForm.tsx` | Client Component | Render form, submit `loginAction`, display errors |
| `loginAction` | Server Action | Verify credentials, call `createSession()`, redirect on success |
| `requireSession()` | Guard (Server Action) | Verify session inside protected mutations; redirect if invalid |
| `createSession()` | Token creation | Generate JWT, write HTTP-only cookie |
| `verifyPassword()` | Crypto | Time-safe hash verification |

---

## Summary Table: Report Data Flow

| Component | Query | Aggregation | Output |
|-----------|-------|-------------|--------|
| `getEventGroupedByType()` | Events in range | Sum by type | Array of grouped rows (count, income, cost, profit) |
| `getEventPerformanceReport()` | Events in range | Per-event financials | Array of event rows |
| `getBalanceSummaryCards()` | Events + movements in range | Totals by category | Five numbers (ingresos, egresos, otros, inversiones, balance) |
| `getMovementSummary()` | Movements in range | Summarize by type | Movements array + totals |
| `getMovementsWithoutEvent()` | Movements (eventId = null) in range | Filter | Movements array |

---

## File Summary

| File | Purpose |
|------|---------|
| `lib/auth/session.ts` | JWT token creation, storage, retrieval; `requireSession()` guard |
| `lib/auth/password.ts` | Scrypt hashing and verification |
| `lib/auth/actions.ts` | Server actions: `loginAction`, `logoutAction` |
| `proxy.ts` | Route protection; redirects unauthenticated to `/login` |
| `app/login/page.tsx` | Login page layout |
| `app/login/LoginForm.tsx` | Login form UI + `useActionState` |
| `lib/reports/reportsService.ts` | Report aggregation functions (grouped, per-event, balance cards, movements) |
| `lib/money.ts` | Cent/peso conversion API |
| `lib/prisma.ts` | Singleton Prisma client with libsql adapter |
| `lib/utils.ts` | Tailwind class combining utility (`cn()`) |
| `lib/events/schema.ts` | Event state enum, form/server schemas |
| `lib/events/financials.ts` | (Imported) Event financial computation |
| `app/(dashboard)/calendario/page.tsx` | Calendar page; fetches events, passes to `CalendarClient` |
| `components/calendario/CalendarClient.tsx` | Interactive calendar (react-big-calendar, state colors, navigation) |
| `components/calendario/CalendarGrid.tsx` | Simple grid calendar (fallback) |
| `app/(dashboard)/reportes/page.tsx` | Reports page; renders three tables (by type, per-event, movements) and summary cards |
| `scripts/hash-password.ts` | CLI to generate password hashes for env setup |

---

Documentation version: 1.0  
Last updated: 2026-06-05  
Maintainer: Claude Code (Technical Documentation Specialist)
