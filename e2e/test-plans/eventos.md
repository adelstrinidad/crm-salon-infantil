# Test Plan — Eventos (central aggregate)

**Routes:** `/eventos`, `/eventos/nuevo`, `/eventos/[id]`, `/eventos/[id]/editar`, `/eventos/[id]/presupuesto`
**Page objects:** `EventoFormPage`, `EventoEditPage`, `EventoDetailPage`
**Factory:** `generateEvento()` (+ `generateEmpleado` for staff flows)
**Key rules:** price is DERIVED from services − bonificados (no manual field);
providers/staff are costs only; edit page AUTOSAVES ("Guardado"); confirmed
RESERVADO events can't overlap → always use `uniqueSlot()`.
**Risks:** stateful dev.db + double-booking guard (unique slots); money pesos↔cents.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Payment lifecycle RESERVADO → SENADO → PAGADO (derived $10.000) | `@e2e` | ✅ automated |
| 2 | Staff: assign estimate → pending flag → log hours → clears → cost on detail | `@e2e` | ✅ automated |
| 3 | Staff editable on a PAGADO event, cost recomputes (6:30 → $19.500) | `@e2e` | ☐ todo (legacy) |
| 4 | save-hours button disabled at 0:00, enabled after time pick | `@regression` | ☐ todo (legacy) |
| 5 | Provider per-event cost snapshot + override → Pago prestadores owed | `@e2e` | ☐ todo |
| 6 | Bonificado lowers derived price (subtotal − bonificado) | `@regression` | ☐ todo |
| 7 | Presupuestar (quote) → appears under Presupuestados, Reservar converts | `@e2e` | ☐ todo |
| 8 | Edit autosave: change notes/estado → "Guardado" persists on reload | `@regression` | ☐ todo |
| 9 | Created event appears on the Calendario | `@e2e` | ☐ todo |

**Out of scope:** API-level (server actions only).
