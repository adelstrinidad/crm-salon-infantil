# Finance (Finanzas) & Payments (Pagos) Modules

**Purpose**: Track all financial accounts, movements, and staff/supplier payments for the venue. Central to cash flow, reconciliation, and settlement.

**Audience**: Backend/full-stack developers, QA.

---

## 1. Domain Concepts

### Accounts (Cuentas)

An **Account** is a named pot of money, e.g. "Caja chica" (petty cash), "Banco" (bank account), "PayPal". Each account tracks its balance by summing all linked movements.

- **Model**: `Account` (prisma/schema.prisma, after "Finanzas" section)
- **Fields**: `id`, `name`, `description`, `createdAt`, `updatedAt`
- **Relation**: 1:M with `Movement` (source account) and (optionally) inbound transfers via `toAccount`

### Movements (Movimientos)

A **Movement** is a financial transaction posted to an account. It has a type (category), amount (in cents), optional description, date, and optional link to an event or another account (for transfers).

**Movement Categories** (enum `MovementType` in schema):
- **INGRESO** (+): Money in (sales, deposits, refunds)
- **EGRESO** (−): Money out (expenses, purchases, general outflows)
- **TRANSFERENCIA** (−): Money moved between accounts; amounts to "from account" only (see edge case below)
- **ARQUEO** (+): Cash count/reconciliation (cash in hand matches books)
- **INVERSION** (−): Capital investment/equipment purchase
- **RETIRO** (−): Owner withdrawal

Each category has a **sign** (`MOVEMENT_SIGN` in lib/finanzas/schema.ts:24) that determines whether it adds or subtracts from a balance:
- `INGRESO` → +1 (adds)
- `ARQUEO` → +1 (adds)
- `EGRESO` → −1 (subtracts)
- `INVERSION` → −1 (subtracts)
- `RETIRO` → −1 (subtracts)
- `TRANSFERENCIA` → −1 (subtracts from source only)

### Balance Computation

**Account balance** = sum of (movement amount × sign per movement type) for all movements in that account.

See [Balance Computation Logic](#3-balance-computation-logic) for step-by-step detail.

### Staff Payments (Pago a prestadores)

Staff (prestadores) are assigned to events and have a **cost** (what the venue pays them per event, in cents). An **EventProvider** join tracks whether payment to that staff member for that event has been settled.

- **Model**: `EventProvider` (eventId + providerId + cost link via `Provider.cost`)
- **Paid state**: `paid` (boolean), `paidAt` (timestamp)
- **Settlement**: Mark as paid + create an EGRESO movement in the designated account

### Supplier Payments (Pago a proveedores)

Suppliers provide **services** to be sold on events. A **Service** links optionally to a **Proveedor** (supplier). An **EventService** join tracks quantity used and whether the supplier has been paid.

- **Model**: `EventService` (eventId + serviceId + qty)
- **Paid state**: `paid` (boolean), `paidAt` (timestamp)
- **Cost calculation**: `service.cost × eventService.qty` (in cents)
- **Settlement**: Mark as paid + create an EGRESO movement in the designated account

---

## 2. Data Model

### Entity Relationships

```
Account
  ↓
  Movement (1:M)
    ├─ accountId (source account)
    ├─ toAccountId? (only for TRANSFERENCIA)
    ├─ type (enum: INGRESO, EGRESO, TRANSFERENCIA, ARQUEO, INVERSION, RETIRO)
    ├─ amount (integer cents)
    ├─ date
    └─ eventId? (optional link to source event)

Provider (prestador)
  ↓
  EventProvider (1:M)
    ├─ eventId
    ├─ providerId
    ├─ provider.cost (in cents — what venue pays)
    ├─ paid (boolean)
    └─ paidAt? (timestamp)

Service
  ├─ proveedorId? (links to supplier)
  ↓
  EventService (1:M)
    ├─ eventId
    ├─ serviceId
    ├─ qty (quantity)
    ├─ service.cost (in cents — what venue pays supplier)
    ├─ paid (boolean)
    └─ paidAt? (timestamp)
```

### Money in Cents Convention

**All financial amounts are stored and computed as integer cents** to avoid floating-point rounding errors.

**Conversion boundaries** (lib/money.ts):
- **Form input** (pesos string) → `parsePesosToCents()` → store as cents
- **Storage** → `formatMoney()` → display as locale-formatted peso string
- **Prefill input** → `centsToPesos()` → show number for `<input type="number">`
- **Internal arithmetic** (balance, summaries) → work in cents only

Example: 1550.50 pesos = 155050 cents; display as "$15.500,5" (Argentine locale).

---

## 3. Balance Computation Logic

Pure, testable math extracted to **lib/finanzas/balance.ts**. No database calls.

### `computeBalance(movements: SignedMovement[]): number`

Sum each movement's impact based on its type.

**Step by step** (from balance.test.ts):
1. Start with balance = 0
2. For each movement:
   - Look up its type in `MOVEMENT_SIGN`
   - Multiply amount × sign (1 or −1)
   - Add to running total
3. Return signed total (can be negative)

**Example** (balance.test.ts:18–27):
```
movements: [
  INGRESO 10000,      → +10000
  ARQUEO 500,         → +500
  EGRESO 3000,        → −3000
  INVERSION 2000,     → −2000
  RETIRO 1000         → −1000
]
balance = 10000 + 500 − 3000 − 2000 − 1000 = 4500 cents ($45.00)
```

### `summarizeMovements(movements: SignedMovement[]): MovementTotals`

Split movements into income (INGRESO + ARQUEO) and expense (EGRESO + INVERSION + RETIRO + TRANSFERENCIA). Report egreso as positive magnitude.

**Returns**: `{ totalIngreso, totalEgreso, net: totalIngreso - totalEgreso }`

**Usage**: Movements list page (lib/finanzas/movimientos/page.tsx:104–116) shows summary row.

### `summarizeGroupedByType(groups): { totalIngreso, totalEgreso }`

Pre-aggregated Prisma `groupBy` result (by type, summed amount). Avoids re-loading every movement row when displaying a summary.

**Query** (finanzasService.ts:63):
```typescript
prisma.movement.groupBy({ 
  by: ["type"], 
  where, 
  _sum: { amount: true } 
})
```

**Summary is correct regardless of pagination** because the groupBy applies to the full filtered set, not just the page (finanzasService.ts:61).

### `getAccountsWithBalance()`

**Query** (finanzasService.ts:99–106):
1. Fetch all accounts with their movements included
2. For each account, call `computeBalance(account.movements)`
3. Return array of `{ ...account, balance: number }`

**Used by**:
- Finance dashboard (app/(dashboard)/finanzas/page.tsx:14–19): Display account cards + total balance
- Payment dialogs: Show available accounts when settling staff/supplier payments

---

## 4. Movement Categories & Balance Impact

| Category | Sign | Effect | Example |
|----------|------|--------|---------|
| **INGRESO** | +1 | Money in | Event payment received, refund issued |
| **ARQUEO** | +1 | Cash count match | Verified cash equals records |
| **EGRESO** | −1 | General expense | Office supplies, maintenance |
| **INVERSION** | −1 | Capital asset | Equipment purchase, furniture |
| **RETIRO** | −1 | Owner withdrawal | Owner takes cash out |
| **TRANSFERENCIA** | −1 | Move between accounts | Caja → Banco (debits source only) |

### TRANSFERENCIA Edge Case

A **TRANSFERENCIA** movement **only debits the source account** (`accountId`) with sign −1. The matching **credit to `toAccountId` is not modeled** (balance.ts:15–17).

**Current behavior** (balance.test.ts:37–39):
```
transfer 7000 pesos between accounts A → B
  Account A: balance −7000
  Account B: balance 0 (no inbound movement modeled)
```

**Rationale** (balance.ts comment): Mirrors current `getAccountsWithBalance` behavior. **Flagged for review** — if the business requires tracking transfers both ways, update `MOVEMENT_SIGN` and the balance logic.

---

## 5. Server-Side Data Access

### **lib/finanzas/finanzasService.ts**

**Account operations**:
- `listAccounts()`: All accounts, sorted by name
- `getAccount(id)`: Single account
- `createAccount(data)`: Create new account
- `updateAccount(id, data)`: Update name/description
- `deleteAccount(id)`: Delete account (cascades via Prisma rules)

**Movement operations**:
- `listMovements(limit = 50)`: Latest 50 movements (descending date)
- `listMovementsFiltered(opts)`: Filtered by date range, account, type + pagination
  - Filters apply across full set for correct summary (groupBy applies to all, not just page)
  - Returns `{ rows, total, totalIngreso, totalEgreso }`
- `getMovement(id)`: Single movement with account
- `createMovement(data)`: Create movement (amounts already converted to cents via Zod)
- `updateMovement(id, data)`: Update existing movement
- `deleteMovement(id)`: Delete movement
- `getMovementsByEvent(eventId)`: All movements linked to an event

**Balance operations**:
- `getAccountsWithBalance()`: All accounts with computed balances

All queries include database I/O + index hints (finanzasService.ts) for efficient filtering.

### **lib/pagos/pagosService.ts**

**Staff payment queries**:
- `getProviderPayments(opts)`: Find EventProvider rows matching filters (date range, provider, paid status)
  - Includes full event + provider details
  - Ordered by event start date
- `markProviderPaid(eventProviderId)`: Set `paid = true`, `paidAt = now()`

**Supplier payment queries**:
- `getProveedorPayments(opts)`: Find EventService rows where service has a supplier, matching filters
  - Includes event + service + supplier details
  - Note: supplier is nested in `service.proveedor` (left-side of tree)
- `markServicePaid(eventServiceId)`: Set `paid = true`, `paidAt = now()`

---

## 6. Validation & Server Actions

### **Zod Schemas** (lib/finanzas/schema.ts)

**Account input**:
```typescript
accountFormInputSchema = {
  name: string (min 1),
  description?: string
}
```

**Movement input** (then transformed via movementSchema):
```typescript
movementFormInputSchema = {
  accountId: string (min 1),
  toAccountId?: string,
  type: MovementType (enum),
  amount: string (parsed to cents),
  description?: string,
  date: string (parsed to Date),
  eventId?: string
}

movementSchema transform:
  amount: parsePesosToCents(amount)
  date: new Date(date)
  toAccountId/eventId: undefined if not provided
```

### **Server Actions** (app/(dashboard)/finanzas/actions.ts)

All actions require session (`requireSession()`), validate input with Zod, call `lib/finanzas` service, then revalidate:

- `createAccountAction(input)`: Create account, revalidate `/finanzas`
- `updateAccountAction(id, input)`: Update account, revalidate `/finanzas`
- `deleteAccountAction(id)`: Delete account, revalidate `/finanzas`
- `createMovementAction(input)`: Create movement, revalidate `/finanzas` + `/finanzas/movimientos`
- `updateMovementAction(id, input)`: Update movement, revalidate both routes
- `deleteMovementAction(id)`: Delete movement, revalidate both routes

**Return type**: `{ ok: true } | { ok: false; error: string }`

On validation error, first error message is returned to the client (actions.ts:17).

### **Payment Actions** (app/(dashboard)/pagos/**actions.ts)

**Staff payment** (`pagarPrestadorAction`):
1. Validate account is selected
2. `markProviderPaid(eventProviderId)` → set paid + paidAt
3. `createMovement(...)` → EGRESO movement in selected account, amount = `provider.cost`, description includes staff name + event name
4. Revalidate payment + finance routes

**Supplier payment** (`pagarProveedorAction`):
1. Validate account is selected
2. `markServicePaid(eventServiceId)` → set paid + paidAt
3. `createMovement(...)` → EGRESO movement, amount = `service.cost × qty`, description includes supplier + service + event
4. Revalidate payment + finance routes

**Atomic**: Both rows are marked paid AND the EGRESO is recorded in a single logical operation (though not in a transaction — Prisma SQLite context doesn't use explicit transactions). **Risk**: If movement creation fails after payment is marked, manual rollback needed.

---

## 7. Money Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ACCOUNTS & MOVEMENTS                        │
└─────────────────────────────────────────────────────────────────┘

  Event revenue paid by client
           ↓
  INGRESO movement → Account balance increases
           ↓
           
  Staff assigned to event (EventProvider.cost)
           ↓ [Payment UI]
           ↓ pagarPrestadorAction()
    - Mark EventProvider.paid = true
    - Create EGRESO movement
           ↓
  Account balance decreases


  Service with supplier (Service.proveedorId, Service.cost × qty)
           ↓ [Payment UI]
           ↓ pagarProveedorAction()
    - Mark EventService.paid = true
    - Create EGRESO movement
           ↓
  Account balance decreases


  Cash counted in hand
           ↓
  ARQUEO movement (reconciliation)
           ↓ (if cash matches records)
  Account balance increases (or confirms match)


  Money moved between accounts
           ↓
  TRANSFERENCIA movement (debits source only)
           ↓
  Source account balance decreases
  Destination account balance unchanged (gap in model)
```

---

## 8. UI Routes & Behavior

### Finance Dashboard (`/finanzas`)

- **Accounts grid**: Each card shows name, description, balance (with color/tone based on sign)
- **Total balance**: Sum of all account balances
- **Recent movements** (latest 30): Table with type badges (color-coded by sign), account, amount (with +/− sign), delete action

**Data fetch**: `getAccountsWithBalance()` + `listMovements(30)`

### Movements List (`/finanzas/movimientos`)

- **Filters**: Date range (from/to), account, type
- **Pagination**: 20 per page
- **Summary row**: Ingresos, Egresos, Net, count (computed from full filtered set, not page)
- **Edit/delete links**: Full CRUD

**Data fetch**: `listMovementsFiltered(...)` with date, account, type, pagination

### Staff Payments (`/pagos/prestadores`)

- **Filters**: Event date range, provider, state (pendiente/pagado)
- **Summary**: Total pending, total paid
- **Rows**: Provider, event, event date, cost, status badge, pay button (if pending + accounts exist)

**Data fetch**: `getProviderPayments(...)` + `listAccounts()` + `listProviders()`

**Pay flow**:
  1. Click "Pagar" button
  2. Dialog with account dropdown + description (prefilled)
  3. Call `pagarPrestadorAction(eventProviderId, amount, accountId, description)`
  4. Mark as paid, create EGRESO, revalidate

### Supplier Payments (`/pagos/proveedores`)

- **Filters**: Event date range, supplier, state
- **Summary**: Total pending, total paid
- **Rows**: Supplier, service, event, event date, cost × qty, status badge, pay button

**Data fetch**: `getProveedorPayments(...)` + `listAccounts()` + `listProveedores()`

**Pay flow**: Same as staff (mark paid + EGRESO movement)

---

## 9. Edge Cases & Limitations

### 1. TRANSFERENCIA Balance Asymmetry

**Current**: TRANSFERENCIA debits source account only. Destination account sees no movement.

**Impact**: 
- Total balance is preserved system-wide (money doesn't disappear), but individual account balances can appear mismatched.
- If business requires tracking both debit and credit, add a second TRANSFERENCIA row with opposite sign to destination, OR update MOVEMENT_SIGN logic.

**Test coverage**: balance.test.ts:37–39

### 2. Payment Atomicity

**Risk**: `pagarPrestadorAction` and `pagarProveedorAction` mark payment, then create movement. If movement creation fails (e.g., bad account), payment is marked but no EGRESO recorded.

**Mitigation** (None currently): Prisma SQLite context doesn't support explicit transactions. Consider wrapping both operations in a `prisma.$transaction()` block if payment reconciliation becomes critical.

### 3. Movement Deletion

Deleting a movement after recording a payment doesn't automatically unpay the EventProvider/EventService row. Staff/supplier remain marked as paid even if the EGRESO is gone.

**Mitigation**: Implement cascade logic or warn user before delete.

### 4. No Vendor Invoicing

Supplier cost is simple (service.cost per unit). No invoice numbering, receipt links, or proof-of-payment storage.

**Roadmap**: Add `Payment` entity with `invoiceNumber`, `receiptUrl`, link to Movement.

---

## 10. Testing

**Unit tests** (lib/finanzas/balance.test.ts):
- `computeBalance`: Movement sign rules, negative balance, TRANSFERENCIA debit
- `summarizeMovements`: Income/expense split, net calculation
- `summarizeGroupedByType`: Aggregated Prisma result split

**Coverage**: Core accounting math. No database I/O.

**E2E tests** (recommended):
- Create account → record INGRESO + EGRESO → verify balance
- Create staff payment → verify EventProvider.paid + EGRESO movement
- Supplier payment → verify EventService.paid + EGRESO, correct qty × cost

---

## 11. Key Files Summary

| File | Purpose |
|------|---------|
| `lib/finanzas/schema.ts` | Zod validators, movement types + signs |
| `lib/finanzas/balance.ts` | Pure balance math, testable |
| `lib/finanzas/finanzasService.ts` | Account & movement CRUD, balance queries |
| `lib/pagos/pagosService.ts` | Staff & supplier payment queries |
| `lib/money.ts` | Cents ↔ pesos conversion |
| `app/(dashboard)/finanzas/actions.ts` | Account & movement Server Actions |
| `app/(dashboard)/finanzas/page.tsx` | Dashboard (accounts + recent movements) |
| `app/(dashboard)/finanzas/movimientos/page.tsx` | Filtered movements list + pagination |
| `app/(dashboard)/pagos/prestadores/page.tsx` | Staff payment list |
| `app/(dashboard)/pagos/prestadores/actions.ts` | `pagarPrestadorAction` |
| `app/(dashboard)/pagos/proveedores/page.tsx` | Supplier payment list |
| `app/(dashboard)/pagos/proveedores/actions.ts` | `pagarProveedorAction` |
| `prisma/schema.prisma` | `Account`, `Movement`, `EventProvider.paid`, `EventService.paid` |

---

## 12. Development Checklist

When adding features or fixing bugs in Finance/Payments:

- [ ] All money amounts in/out use integer cents
- [ ] Zod schemas validate before service layer is called
- [ ] Balance computation tested with edge cases (negative, transfers, zero)
- [ ] Pagination summaries use full filtered set, not just page
- [ ] Payment actions mark paid AND record EGRESO (or fail both)
- [ ] Server Actions revalidate affected routes (finance + payments + movements)
- [ ] No silent failures — user sees error if validation or DB operation fails
- [ ] Test output is pristine (all tests pass)

