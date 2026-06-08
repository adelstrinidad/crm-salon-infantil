# Test Plan — Clientes

**Route(s):** `/clientes`, `/clientes/nuevo`, `/clientes/[id]`, `/clientes/[id]/editar`
**Page objects:** `ClientesListPage`, `ClienteFormPage`
**Factory:** `generateClient()`
**Risks:** Stateful dev.db (use unique factory names); list paginates (15/page) so
assert via search, not page-1 presence.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Create a client → findable in list via search | `@smoke` | ✅ automated |
| 2 | Reject submission when name is empty (stays on form) | `@regression` | ✅ automated |
| 3 | Edit a client → changes persist | `@regression` | ☐ todo |
| 4 | Delete a client → removed from list | `@destructive` | ☐ todo |
| 5 | Search filters the list to matching clients | `@regression` | ☐ todo |
| 6 | Invalid email format rejected | `@regression` | ☐ todo |
| 7 | Client detail page shows created fields | `@regression` | ☐ todo |

**Out of scope:** API-level validation (no REST API — server actions only).
