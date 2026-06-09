# Test Plan — Pagos

**Route(s):** `/pagos/prestadores`, `/pagos/personal`, `/pagos/proveedores`
**Page objects:** `PagoPrestadoresPage`, `PagoPersonalPage`, `PagoProveedoresPage`
**Model:** Pago prestadores unifies TWO sources — providers assigned directly to an
event (EventProvider) and services backed by a prestador (EventService, owed = cost×qty).
Pago proveedores is a placeholder (insumos/stock phase). Pago personal = internal staff hours.
**Factory:** none (rows are derived from event assignments created in other domains).
**Risks:** Stateful dev.db — deep pay flows must create their own owed entity with a
unique factory name + `uniqueSlot()` event so prior runs don't leave the row already
"Pagado". `Pago a personal` rows are only payable once the staff member's **real hours**
are logged (otherwise the row shows "Registrá las horas", no "Pagar" button). All three
pages render a single table (no desktop+mobile duplicate); rows disambiguate by
`getByRole("row").filter({ hasText })`.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Pago a prestadores page loads with its heading | `@smoke` | ✅ automated |
| 2 | Pago a personal page loads with its heading | `@smoke` | ✅ automated |
| 3 | Pago a proveedores page loads with its heading | `@smoke` | ✅ automated |
| 4 | Pay a prestador: create event + assign provider → Pagar/Confirmar → row Pagado + EGRESO movement "Pago {provider} — {event}" | `@e2e` | ✅ automated (`e2e/pago-prestadores.spec.ts`) |
| 5 | Pay personal: assign staff + log real hours → row payable → Pagar/Confirmar → row Pagado + EGRESO movement "Pago personal — {staff}" | `@e2e` | ✅ automated (`e2e/pago-personal.spec.ts`) |
| 6 | Pay a service-backed prestador: service with a prestador → used on event → row on Pago prestadores (kind=service), owed cost×qty → Pagar/Confirmar → EGRESO "Pago {prestador} — {service} — {event}" | `@e2e` | ✅ automated (`e2e/pago-prestador-servicio.spec.ts`) |
| 6b | Pago proveedores shows the "Compras — próximamente" EmptyState (insumos/stock phase) | `@regression` | ☐ todo |
| 7 | Pago a personal: row shows "Registrá las horas" (no Pagar) until real hours logged | `@regression` | ✅ covered in #5 |
| 8 | Estado filter (Pendiente/Pagado) narrows the list | `@regression` | ☐ todo |
| 9 | Per-entity filter (Prestador/Empleado/Proveedor) narrows the list | `@regression` | ☐ todo |
| 10 | Fecha evento desde/hasta range filter narrows the list | `@regression` | ☐ todo |
| 11 | Pagar opens the inline account Select; Cancelar dismisses it without paying | `@regression` | ☐ todo |
| 12 | Amount owed equals the per-event cost (prestadores) / cost × qty (proveedores) / hourly cost (personal), via `money()` | `@regression` | ☐ todo |

**Out of scope:** API-level validation (no REST API — server actions only). Deep pay
flows (#4–#6) need owed entities built across the eventos/personal/providers domains;
the orchestrator hand-builds these as cross-domain `@e2e` specs.
