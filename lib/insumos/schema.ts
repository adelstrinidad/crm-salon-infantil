import { z } from "zod/v4";
import { parsePesosToCents } from "@/lib/money";

// Supply units. String column in the DB; this map is the single source of truth
// for the dropdown (value → Spanish label) and the Zod enum that validates input.
export const INSUMO_UNIT_LABELS = {
  unidad: "Unidad",
  litro: "Litro",
  kg: "Kilogramo",
  caja: "Caja",
} as const;

export type InsumoUnit = keyof typeof INSUMO_UNIT_LABELS;
export const INSUMO_UNITS = Object.keys(INSUMO_UNIT_LABELS) as [InsumoUnit, ...InsumoUnit[]];

export const insumoFormInputSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  unit: z.enum(INSUMO_UNITS),
  // Non-negative whole units. The form registers these inputs with
  // `valueAsNumber`, so the schema validates numbers directly (no coercion).
  stockQty: z.number().int("Debe ser un número entero").min(0, "No puede ser negativo"),
  minStock: z.number().int("Debe ser un número entero").min(0, "No puede ser negativo"),
  // What the client pays per unit consumed at an event. Pesos string from the
  // form (same pattern as Service cost/price), converted to cents on transform.
  eventPrice: z.string().refine((v) => v === "" || Number.parseFloat(v) >= 0, {
    message: "No puede ser negativo",
  }),
  notes: z.string().optional(),
});

export type InsumoFormInput = z.infer<typeof insumoFormInputSchema>;

export const insumoSchema = insumoFormInputSchema.transform((data) => ({
  ...data,
  eventPrice: parsePesosToCents(data.eventPrice),
}));

export type InsumoFormValues = z.output<typeof insumoSchema>;
