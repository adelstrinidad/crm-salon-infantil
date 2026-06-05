import { z } from "zod";
import { parsePesosToCents } from "@/lib/money";

export const MovementType = {
  INGRESO: "INGRESO",
  EGRESO: "EGRESO",
  TRANSFERENCIA: "TRANSFERENCIA",
  ARQUEO: "ARQUEO",
  INVERSION: "INVERSION",
  RETIRO: "RETIRO",
} as const;
export type MovementType = (typeof MovementType)[keyof typeof MovementType];

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  INGRESO: "Ingreso",
  EGRESO: "Egreso",
  TRANSFERENCIA: "Transferencia",
  ARQUEO: "Arqueo",
  INVERSION: "Inversión",
  RETIRO: "Retiro",
};

// +1 adds to balance, -1 subtracts
export const MOVEMENT_SIGN: Record<MovementType, 1 | -1> = {
  INGRESO: 1,
  ARQUEO: 1,
  EGRESO: -1,
  INVERSION: -1,
  RETIRO: -1,
  TRANSFERENCIA: -1,
};

// How a movement is classified in income/expense (P&L) summaries — SEPARATE
// from its balance effect (MOVEMENT_SIGN above). A TRANSFERENCIA is an internal
// move between two own accounts and ARQUEO is a cash-count reconciliation;
// neither is real business income or expense, so both are "neutral" and excluded
// from ingreso/egreso totals (counting them double-counts transfers as expense
// and inflates income with reconciliations). They still move the account balance.
export type MovementFlow = "income" | "expense" | "neutral";
export const MOVEMENT_FLOW: Record<MovementType, MovementFlow> = {
  INGRESO: "income",
  EGRESO: "expense",
  INVERSION: "expense",
  RETIRO: "expense",
  TRANSFERENCIA: "neutral",
  ARQUEO: "neutral",
};

export const accountFormInputSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
});
export type AccountFormInput = z.infer<typeof accountFormInputSchema>;

export const movementFormInputSchema = z.object({
  accountId: z.string().min(1, "La cuenta es requerida"),
  toAccountId: z.string().optional(),
  type: z.nativeEnum(MovementType),
  amount: z.string(),
  description: z.string().optional(),
  date: z.string().min(1, "La fecha es requerida"),
  eventId: z.string().optional(),
});
export type MovementFormInput = z.infer<typeof movementFormInputSchema>;

export const movementSchema = movementFormInputSchema.transform((d) => ({
  ...d,
  amount: parsePesosToCents(d.amount),
  date: new Date(d.date),
  toAccountId: d.toAccountId || undefined,
  eventId: d.eventId || undefined,
}));
export type MovementFormValues = z.output<typeof movementSchema>;
