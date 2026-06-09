# Test Plan — Servicios

**Route(s):** `/servicios`, `/servicios/nuevo`, `/servicios/[id]/editar`
**Page objects:** `ServiciosListPage`, `ServicioFormPage`
**Factory:** `generateServicio()`
**Risks:** Stateful dev.db (use unique factory names); list paginates (15/page) so
assert via search, not page-1 presence. Cost/price are pesos in `type="number"`
inputs (spinbutton role); the form parses pesos → cents on submit.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Create a service → findable in list via search | `@smoke` | ✅ automated |
| 2 | Reject submission when name is empty (stays on form) | `@regression` | ✅ automated |
| 3 | Edit a service → cost/price changes persist | `@regression` | ☐ todo |
| 4 | Delete a service → removed from list | `@destructive` | ☐ todo |
| 5 | Search filters the list to matching services | `@regression` | ☐ todo |
| 6 | Filter by prestador narrows the list | `@regression` | ☐ todo |
| 7 | Ganancia column equals price − cost | `@regression` | ☐ todo |
| 8 | Assign a prestador to a service (NativeSelect) → drives Pago prestadores | `@e2e` | ✅ covered in `pagos/e2e/pago-prestador-servicio.spec.ts` |

**Out of scope:** API-level validation (no REST API — server actions only).
