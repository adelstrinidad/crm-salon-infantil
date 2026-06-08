# Test Plan — Finanzas (Cuentas)

**Route(s):** `/finanzas`, `/finanzas/cuentas/nueva`, `/finanzas/cuentas/[id]/editar`
**Page objects:** `CuentasListPage`, `CuentaFormPage`
**Factory:** `generateCuenta()`
**Risks:** Stateful dev.db (use unique factory names). The finanzas page renders an
accounts Card grid AND a recent-movements table — assert the account by name via
`cardByName()` (uses `.first()`). On success the form redirects to `/finanzas`
(not a dedicated list route).

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Create an account → findable in finanzas list | `@smoke` | ✅ automated |
| 2 | Reject submission when name is empty (stays on form) | `@regression` | ✅ automated |
| 3 | Edit an account → changes persist | `@regression` | ☐ todo |
| 4 | New account appears in the balance-total card | `@regression` | ☐ todo |
| 5 | Description is optional (create with name only) | `@regression` | ☐ todo |
| 6 | Account selectable in the movement form picker | `@regression` | ☐ todo |

**Out of scope:** API-level validation (no REST API — server actions only);
balance math (covered by lib unit/integration tests).
