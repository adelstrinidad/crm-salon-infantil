// Stock-ledger vocabulary, kept Prisma-free so it's unit-testable.
// A StockMovement.kind plus the sign its delta carries.

export const STOCK_KIND_LABELS = {
  compra: "Compra",
  consumo: "Consumo",
  ajuste: "Ajuste",
  merma: "Merma",
} as const;
export type StockKind = keyof typeof STOCK_KIND_LABELS;

// The manual adjustment options shown in the "Ajustar stock" form. Each maps a
// single picked option to a (kind, direction) so the form needs only one extra
// numeric field. Compra entries are never created here — they come from
// recording a purchase.
export const STOCK_ADJUST_OPS = {
  consumo: { kind: "consumo", sign: -1, label: "Consumo (−)" },
  merma: { kind: "merma", sign: -1, label: "Merma (−)" },
  "ajuste-sumar": { kind: "ajuste", sign: 1, label: "Ajuste: sumar (+)" },
  "ajuste-restar": { kind: "ajuste", sign: -1, label: "Ajuste: restar (−)" },
} as const;
export type StockAdjustOp = keyof typeof STOCK_ADJUST_OPS;
export const STOCK_ADJUST_OP_KEYS = Object.keys(STOCK_ADJUST_OPS) as [
  StockAdjustOp,
  ...StockAdjustOp[],
];

// Resolve a picked op + positive quantity into a signed delta and its kind.
export function resolveAdjust(op: StockAdjustOp, qty: number): { kind: StockKind; delta: number } {
  const { kind, sign } = STOCK_ADJUST_OPS[op];
  return { kind, delta: sign * qty };
}
