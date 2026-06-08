# Test Plan — Movimientos

**Route(s):** `/finanzas/movimientos`, `/finanzas/movimientos/nuevo`, `/finanzas/movimientos/[id]/editar`
**Page objects:** `MovimientosListPage`, `MovimientoFormPage`
**Factory:** `generateMovimiento()`
**Seeded data:** account `Seeded.ACCOUNT` ("Caja"); movement types Ingreso/Egreso/Transferencia/Arqueo/Inversión/Retiro.
**Risks:**
- Stateful dev.db — use unique factory descriptions ("E2E …" + token); never assert on page-1 presence, the list paginates and defaults to a current-month date filter (a movement dated today is in scope; older dates aren't).
- "Tipo" and "Cuenta origen" are Radix `Select` (not native) — drive via labelled trigger → `getByRole("option")`, never `selectOption()`.
- On success the form redirects to `/finanzas` (cancelHref default), not to the movements list — `submit()` waits for `/finanzas`, then navigate to the list to assert.
- Form defaults: type=Ingreso, amount="0", date=today; only `accountId` starts empty, so an empty-account submit is the reliable required-field case.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Create an Ingreso movement → findable in list | `@smoke` | ✅ automated |
| 2 | Reject submission when account is empty (stays on form) | `@regression` | ✅ automated |
| 3 | Create an Egreso → shows with loss tone / − sign | `@regression` | ☐ todo |
| 4 | Create a Transferencia (origin + destination accounts) | `@regression` | ☐ todo |
| 5 | Filter list by Cuenta and by Tipo | `@regression` | ☐ todo |
| 6 | Edit a movement → changes persist | `@regression` | ☐ todo |
| 7 | Delete a movement → removed from list | `@destructive` | ☐ todo |
| 8 | Ingreso increases account balance (e2e via balance page) | `@e2e` | ☐ todo |

**Reuse:** `MovimientoFormPage.createMovement(data)` is the generic create action for
balance-effect e2e flows that need a movement on the books before asserting balance.

**Out of scope:** API-level validation (no REST API — server actions only).
