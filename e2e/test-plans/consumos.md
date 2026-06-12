# Test Plan — Consumos por mesa (event consumption)

Feature: during a running event (EN_CURSO) staff capture what each table (Mesa
1–5) requests; each line snapshots the insumo's "Precio evento" and deducts
stock via the ledger. Closing freezes the bill; the client pays it as an
INGRESO `kind=consumo` movement that never counts toward the event price.

## Risks
- Consumption payment inflating the event's Cobrado/Saldo (kind filter).
- Stock counter and ledger diverging on capture/anulación.
- Capture allowed outside the start→close window.
- Bill changing after a catalog price edit (snapshot must hold).

## Coverage by layer
- **Unit** (`lib/consumos/*.test.ts`, `lib/events/paymentState.test.ts`):
  bill math/grouping, Zod boundaries (mesa 1..5, qty int > 0), EN_CURSO never
  auto-advances.
- **Integration** (`tests/integration/consumos.test.ts`): full lifecycle,
  window guards, snapshot price, tx rollback on insufficient stock, reversing
  ledger row on remove, settle-pattern payment + double-pay guard, cobrado
  isolation.
- **E2E** (`tests/eventos/e2e/consumos.spec.ts`, `@e2e`): UI flow — priced
  insumo → reserve → Iniciar evento → capture Mesa 1 + Mesa 5 → Cerrar →
  Registrar pago consumos → movement recorded, Cobrado stays $0, ledger shows
  both deductions.

## Data
- `CONSUMOS_BILL` (static/eventos/financials.ts): price 1500, qty 2+1 → totals
  3000/1500/4500. Insumo from `generateInsumo` (Faker, unique token); event
  from `generateEvento` (unique slot).

## Fase A+B additions
- **Voids (anulaciones)**: manager-code gate (`E2E_MANAGER_CODE`, default `encargado1234`),
  reason enum (merma keeps stock down), append-only audit shown on capture page
  and report. E2E: wrong code rejected → right code voids → audit row visible.
  Integration: per-reason stock handling, paid-line guard, audit snapshots.
- **Payer per line**: CLIENTE (single settle at close) vs INVITADO groups
  (`payerLabel`, chargeable anytime after start). E2E: guest pending → Cobrar →
  Pagado; client bill excludes guest lines. Integration: split settle, per-side
  double-pay guards, unknown guest.

## Out of scope (covered elsewhere / future)
- Print rendering of the report (manual print → PDF).
- Multi-insumo bills (math covered at unit level).
