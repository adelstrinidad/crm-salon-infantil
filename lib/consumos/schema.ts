// Consumos (per-table consumption during a running event) — validation layer.
// The venue floor has a fixed set of tables; TABLE_COUNT is the single source
// of truth for pickers, validation, and the report grouping.

import { z } from "zod";
import { REMOVAL_REASON_KEYS } from "./removalReasons";

export const TABLE_COUNT = 5;

export const TABLE_NUMBERS = Array.from({ length: TABLE_COUNT }, (_, i) => i + 1);

export function tableLabel(tableNumber: number): string {
  return `Mesa ${tableNumber}`;
}

// Who owes a line: the organizer (CLIENTE, default — settled in one payment at
// close) or a self-paying guest (INVITADO, identified by a free-text label and
// chargeable at any time).
export const PAYER_TYPE_LABELS = {
  CLIENTE: "Cliente",
  INVITADO: "Invitado",
} as const;

export type PayerType = keyof typeof PAYER_TYPE_LABELS;
export const PAYER_TYPES = Object.keys(PAYER_TYPE_LABELS) as [PayerType, ...PayerType[]];

// One consumption line as captured from the floor: which table asked, what
// insumo, how many units, and who pays it. Price is never sent by the client —
// the service snapshots Insumo.eventPrice server-side.
export const consumoInputSchema = z
  .object({
    insumoId: z.string().min(1, "Seleccioná un insumo"),
    tableNumber: z
      .number()
      .int("Mesa inválida")
      .min(1, "Mesa inválida")
      .max(TABLE_COUNT, "Mesa inválida"),
    qty: z.number().int("Ingresá una cantidad válida").positive("Ingresá una cantidad válida"),
    payerType: z.enum(PAYER_TYPES),
    payerLabel: z.string().trim().optional(),
  })
  .refine((d) => d.payerType !== "INVITADO" || (d.payerLabel && d.payerLabel.length > 0), {
    message: "Indicá quién es el invitado",
    path: ["payerLabel"],
  });

export type ConsumoInput = z.infer<typeof consumoInputSchema>;

// Voiding a captured line (anulación). Requires the manager approval code and
// a reason; "otro" additionally requires free text. The reason drives stock
// handling (see removalReasons.ts).
export const consumoRemovalInputSchema = z
  .object({
    reason: z.enum(REMOVAL_REASON_KEYS),
    reasonText: z.string().trim().optional(),
    managerCode: z.string().min(1, "Ingresá el código del encargado"),
  })
  .refine((d) => d.reason !== "otro" || (d.reasonText && d.reasonText.length > 0), {
    message: "Detallá el motivo",
    path: ["reasonText"],
  });

export type ConsumoRemovalInput = z.infer<typeof consumoRemovalInputSchema>;

// Payment of the closed consumption bill. Amount is computed server-side from
// the recorded lines (settle pattern) — only account/date/concept come in.
export const consumoPagoInputSchema = z.object({
  accountId: z.string().min(1, "Seleccioná una cuenta"),
  description: z.string().trim(),
  date: z.string().min(1, "La fecha es requerida"),
});

export const consumoPagoSchema = consumoPagoInputSchema.transform((data) => ({
  ...data,
  date: new Date(data.date),
}));

export type ConsumoPagoInput = z.infer<typeof consumoPagoInputSchema>;
export type ConsumoPagoValues = z.output<typeof consumoPagoSchema>;
