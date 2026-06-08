# Test Plan — Reportes

**Route(s):** `/reportes`
**Page objects:** `ReportesPage`
**Factory:** none (read-only hub; no entities created here)
**Risks:** Read-only page driven by date/state GET filter (defaults to current
month). Sections render an empty-state `<p>` when no data falls in the period —
assert section **headings** (always present), not row content, for the smoke
check. Money figures rendered via `formatMoney`/`Money` (cents → pesos); build
expected strings with `helpers/util/money.ts`, never hardcode `$10.000`.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Hub loads: heading + 3 sections + filter form visible | `@smoke` | ✅ automated |
| 2 | Filter by date range narrows the per-event breakdown | `@regression` | ☐ todo |
| 3 | Filter by event state narrows balance-by-type rows | `@regression` | ☐ todo |
| 4 | Balance summary cards show correct totals for a known event | `@regression` | ☐ todo |
| 5 | Movements-not-tied-to-event section lists an independent movement | `@regression` | ☐ todo |
| 6 | Empty period shows "Sin eventos en el período." empty state | `@regression` | ☐ todo |

**Out of scope:** API-level validation (no REST API — server-rendered page only).
