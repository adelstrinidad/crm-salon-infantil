# Test Plan — Compras (Purchases)

**Route(s):** `/compras`, `/compras/nuevo`, `/compras/[id]`
**Page objects:** `ComprasListPage`, `CompraFormPage`, `PagoProveedoresPage`
**Factory:** `generateCompraLine(insumoName)` (refs an existing insumo)
**Depends on:** seeded accounts (settlement needs ≥1 cuenta — same dependency as
the other pago specs); a proveedor and an insumo created in-test.
**Risks:** Stateful dev.db (unique factory proveedor names isolate rows). Radix
`Select` for proveedor + per-line insumo (`getByLabel`→`getByRole("option")`,
never `selectOption`). Money entered in pesos, stored cents. Recording a compra
raises insumo stock; deleting an unpaid compra reverses it; paid compras can't be
deleted. Settlement posts an EGRESO movement.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Record purchase → shows Pendiente → pay from Pago a proveedores → Pagada | `@e2e` | ✅ automated |
| 2 | Recording a purchase raises the insumo's stock | `@regression` | ☐ todo (covered by integration) |
| 3 | Delete an unpaid purchase → reverses stock | `@destructive` | ☐ todo (covered by integration) |
| 4 | Reject a purchase with no lines / invalid qty or cost | `@regression` | ☐ todo |
| 5 | Multi-line purchase totals correctly | `@regression` | ☐ todo |
| 6 | Filter compras by estado (pendiente/pagada) | `@regression` | ☐ todo |

**Out of scope (later phase):** stock-movement audit / consumption entries,
low-stock dashboard. API-level validation (no REST API — server actions only).
