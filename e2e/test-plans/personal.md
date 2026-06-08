# Test Plan — Personal

**Route(s):** `/personal`, `/personal/nuevo`, `/personal/[id]/editar`
**Page objects:** `PersonalListPage`, `EmpleadoFormPage`
**Factory:** `generateEmpleado()`
**Risks:** Stateful dev.db (use unique factory names); list paginates (15/page) so
assert via search, not page-1 presence. The name column is plain table/card text
(no link), so locate rows via `getByText`. The "Costo por hora" field is a
spinbutton (type=number) entered in pesos.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Create a staff member → findable in list via search | `@smoke` | ✅ automated |
| 2 | Reject submission when name is empty (stays on form) | `@regression` | ✅ automated |
| 3 | Edit a staff member → changes persist | `@regression` | ☐ todo |
| 4 | Delete a staff member → removed from list | `@destructive` | ☐ todo |
| 5 | Search filters the list to matching staff | `@regression` | ☐ todo |
| 6 | Negative hourly rate rejected | `@regression` | ☐ todo |
| 7 | Inactive staff shown with the Inactivo badge | `@regression` | ☐ todo |

**Out of scope:** API-level validation (no REST API — server actions only).
Staff assignment to events and hour logging are covered by `staff-hours.spec.ts`.
