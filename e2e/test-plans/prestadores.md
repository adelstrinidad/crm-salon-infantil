# Test Plan — Prestadores

**Route(s):** `/prestadores`, `/prestadores/nuevo`, `/prestadores/[id]/editar`
**Page objects:** `PrestadoresListPage`, `PrestadorFormPage`
**Factory:** `generatePrestador()`
**Risks:** Stateful dev.db (use unique factory names); list paginates (15/page) so
assert via search, not page-1 presence. Cost is a number spinbutton entered in pesos.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Create a provider → findable in list via search | `@smoke` | ✅ automated |
| 2 | Reject submission when name is empty (stays on form) | `@regression` | ✅ automated |
| 3 | Edit a provider → changes persist | `@regression` | ☐ todo |
| 4 | Delete a provider → removed from list | `@destructive` | ☐ todo |
| 5 | Search filters the list to matching providers | `@regression` | ☐ todo |
| 6 | Sort by name/cost reorders the list | `@regression` | ☐ todo |
| 7 | Provider created at cost 0 is allowed | `@regression` | ☐ todo |

**Out of scope:** API-level validation (no REST API — server actions only).
