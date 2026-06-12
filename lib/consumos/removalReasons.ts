// Void (anulación) reason vocabulary — Prisma-free so it's unit-testable.
// The reason decides what happens to stock when a captured line is voided:
//   - restoresStock: the units physically return to the shelf (the guest
//     changed their mind, or the line was a data-entry / delivery mistake).
//   - merma: the units are physically lost (broken/spilled on the way) — the
//     void removes the charge but the stock stays down, reclassified from
//     "consumo-evento" to "merma" so per-kind ledger totals stay truthful.
// Every void, whatever the reason, requires the manager approval code.

export const REMOVAL_REASONS = {
  arrepentimiento: { label: "Arrepentimiento del invitado", restoresStock: true },
  "error-carga": { label: "Error de carga", restoresStock: true },
  "error-entrega": { label: "Error de entrega", restoresStock: true },
  merma: { label: "Merma (rotura/derrame)", restoresStock: false },
  otro: { label: "Otro", restoresStock: true },
} as const;

export type RemovalReason = keyof typeof REMOVAL_REASONS;

export const REMOVAL_REASON_KEYS = Object.keys(REMOVAL_REASONS) as [
  RemovalReason,
  ...RemovalReason[],
];

export function removalReasonLabel(reason: string): string {
  return REMOVAL_REASONS[reason as RemovalReason]?.label ?? reason;
}

export function reasonRestoresStock(reason: RemovalReason): boolean {
  return REMOVAL_REASONS[reason].restoresStock;
}
