# Test Plan — Calendario

**Route(s):** `/calendario`
**Page objects:** `CalendarioPage`
**Factory:** none (read-only page; cross-domain scenarios reuse `generateEvent()`)
**Risks:** react-big-calendar renders no app-defined `data-testid`s and forbidden
CSS selectors — anchor on the custom toolbar (`Hoy` button, view buttons) and on
event titles via `getByText(...).first()`. View state is client-only (no URL
change). On viewports ≤768px the calendar defaults to the Lista/agenda view, so
do not assume Month is active on load. Stateful dev.db: a created event lands on
its real start date, so cross-domain checks must navigate to that month/day.

| # | Scenario | Tag | Status |
|---|----------|-----|--------|
| 1 | Calendar renders + switching to Lista shows agenda headers | `@smoke` | ✅ automated |
| 2 | A created event appears on the calendar (cross-domain: create via event form → find on calendar) | `@e2e` | ☐ todo |
| 3 | Clicking an event chip navigates to its detail page | `@regression` | ☐ todo |
| 4 | Legend state filter hides/shows events of a state | `@regression` | ☐ todo |
| 5 | "Nuevo evento" link opens the create-event form | `@smoke` | ☐ todo |

**Out of scope:** Drag-to-reschedule (`window.confirm`/`alert` dialogs), holiday
fetch (external API), color/style assertions (inline hex via `eventPropGetter`).
API-level validation (no REST API — server actions only).
