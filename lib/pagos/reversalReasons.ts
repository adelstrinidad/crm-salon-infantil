// Payment-reversal (anulación de pago) reason vocabulary — Prisma-free so it's
// unit-testable. A reversal undoes a settled payment by posting a compensating
// INGRESO and returning the line to "pendiente"; the reason is recorded in the
// append-only ReversedPayment audit. Every reversal requires the manager code.

export const REVERSAL_REASONS = {
  "error-monto": { label: "Monto incorrecto" },
  "error-cuenta": { label: "Cuenta incorrecta" },
  "pago-duplicado": { label: "Pago duplicado" },
  "no-correspondia": { label: "No correspondía pagar" },
  otro: { label: "Otro" },
} as const;

export type ReversalReason = keyof typeof REVERSAL_REASONS;

export const REVERSAL_REASON_KEYS = Object.keys(REVERSAL_REASONS) as [
  ReversalReason,
  ...ReversalReason[],
];

export function reversalReasonLabel(reason: string): string {
  return REVERSAL_REASONS[reason as ReversalReason]?.label ?? reason;
}
