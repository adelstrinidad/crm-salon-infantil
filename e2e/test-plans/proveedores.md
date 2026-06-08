# Test Plan — Proveedores

**Route(s):** `/proveedores`, `/proveedores/nuevo`, `/proveedores/[id]/editar`
**Page objects:** `ProveedoresListPage`, `ProveedorFormPage`
**Factory:** `generateProveedor()`
**Risks:** Stateful dev.db (use unique factory names); list paginates (15/page) so
assert via search, not page-1 presence. Suppliers are name + contact only (no money fields).

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Create a supplier → findable in list via search | `@smoke` | ✅ automated |
| 2 | Reject submission when name is empty (stays on form) | `@regression` | ✅ automated |
| 3 | Edit a supplier → changes persist | `@regression` | ☐ todo |
| 4 | Delete a supplier → removed from list | `@destructive` | ☐ todo |
| 5 | Search filters the list to matching suppliers | `@regression` | ☐ todo |
| 6 | Invalid email format rejected | `@regression` | ☐ todo |

**Out of scope:** API-level validation (no REST API — server actions only).
