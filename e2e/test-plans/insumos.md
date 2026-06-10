# Test Plan — Insumos (Stock / Inventario)

**Route(s):** `/insumos`, `/insumos/nuevo`, `/insumos/[id]/editar`
**Page objects:** `InsumosListPage`, `InsumoFormPage`
**Factory:** `generateInsumo()`
**Risks:** Stateful dev.db (use unique factory names); list paginates (15/page) so
assert via search, not page-1 presence. `unit` is a Radix `Select` (default
"Unidad" — only touch it via `getByLabel`/`getByRole("option")` when testing a
non-default unit). Stock/min are whole non-negative units. Low-stock badge shows
when `stockQty <= minStock`.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Create a supply → findable in list via search | `@smoke` | ✅ automated |
| 2 | Reject submission when name is empty (stays on form) | `@regression` | ✅ automated |
| 3 | Edit a supply → changes persist | `@regression` | ☐ todo |
| 4 | Delete a supply → removed from list | `@destructive` | ☐ todo |
| 5 | Search filters the list to matching supplies | `@regression` | ☐ todo |
| 6 | Low-stock badge shows when stock ≤ mínimo | `@regression` | ☐ todo |
| 7 | Reject negative / non-integer stock | `@regression` | ☐ todo |
| 8 | Record a consumo → count drops + ledger row appears | `@e2e` | ✅ automated |
| 9 | Negative-driving adjustment is rejected | `@regression` | ☐ todo (covered by integration) |
| 10 | "Bajo stock" filter shows only insumos ≤ mínimo | `@regression` | ☐ todo |

**Stock detail page** (`/insumos/[id]`): current count + low badge, "Ajustar stock"
form (Consumo/Merma/Ajuste±, Radix `Select` aria-label "Tipo de ajuste"), and the
StockMovement ledger. Compra entries appear here as "Compra" rows.

**Out of scope (done in earlier/this phase, or later):** purchases (see
`compras.md`), supplier payments wired to `/pagos/proveedores` (done). API-level
validation (no REST API — server actions only).
