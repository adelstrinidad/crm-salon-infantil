// Curated money fixtures for event financial flows. Amounts are in PESOS (the
// app stores cents). Expected totals are derived by the app from these inputs;
// kept here so specs assert against named constants, not magic numbers.

export const PAYMENT_LIFECYCLE = {
  /** Seeded "Animación" service price → the derived event total. */
  servicePrice: 10000,
  /** First (partial) cobro → advances RESERVADO to SENADO. */
  partial: 4000,
  /** Remaining cobro → completes the total, advances to PAGADO. */
  remaining: 6000,
} as const;

export const STAFF_COST = {
  /** Pending-flag flow: $2.500/h × 5h = $12.500. */
  basic: { ratePesos: "2500", hours: "5", cost: 12500 },
  /** PAGADO-edit recompute: estimate 6h ($18.000) → real 6:30 ($19.500). */
  recompute: {
    ratePesos: "3000",
    estimateHours: "6",
    estimateCost: 18000,
    realHours: "6",
    realMinutes: "30",
    realCost: 19500,
  },
  /** Save-button gating flow (rate irrelevant to the assertion). */
  gating: { ratePesos: "2000" },
  /** Pago personal flow: $2.000/h × 5h = $10.000 owed. */
  payment: { ratePesos: "2000", hours: "5", owed: 10000 },
} as const;

// Consumption-bill flow: an insumo priced for events, consumed from two tables
// while the event is EN_CURSO. Totals derived: price × qty per mesa.
export const CONSUMOS_BILL = {
  /** Insumo "Precio evento" in pesos (form input). */
  eventPricePesos: "1500",
  /** Starting stock so both captures always fit. */
  initialStock: 20,
  mesa1Qty: 2,
  mesa5Qty: 1,
  /** 1500 × 2 */
  mesa1Total: 3000,
  /** 1500 × 1 */
  mesa5Total: 1500,
  /** 1500 × 3 — the bill the client pays at close. */
  total: 4500,
} as const;

// Per-event provider cost (snapshotted from the catalog) → owed on Pago prestadores.
export const PROVIDER_PAYMENT = { costPesos: "1500", owed: 1500 } as const;

// Service backed by a prestador: the service cost is owed to that prestador when
// the service is used on an event → appears on Pago prestadores (service kind).
export const SERVICE_PRESTADOR = { serviceCostPesos: "2000", owed: 2000 } as const;
