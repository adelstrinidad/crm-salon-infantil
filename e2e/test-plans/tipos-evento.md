# Test Plan — Tipos de evento

**Route(s):** `/tipos-evento`, `/tipos-evento/nuevo`, `/tipos-evento/[id]/editar`
**Page objects:** `TiposEventoListPage`, `TipoEventoFormPage`
**Factory:** `generateTipoEvento()`
**Risks:** Stateful dev.db (use unique factory names); list paginates (15/page) so
assert via search, not page-1 presence. Single-field form (only `Nombre`); empty
name is rejected client-side by Zod (`min(1)`) so the form does not redirect.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Create an event type → findable in list via search | `@smoke` | ✅ automated |
| 2 | Reject submission when name is empty (stays on form) | `@regression` | ✅ automated |
| 3 | Edit an event type → changes persist | `@regression` | ☐ todo |
| 4 | Delete an event type → removed from list | `@destructive` | ☐ todo |
| 5 | Search filters the list to matching event types | `@regression` | ☐ todo |
| 6 | Sort options reorder the list | `@regression` | ☐ todo |

**Out of scope:** API-level validation (no REST API — server actions only).
