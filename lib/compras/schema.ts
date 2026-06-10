import { z } from "zod/v4";
import { parsePesosToCents } from "@/lib/money";

// Two-layer schema (see other domain modules): the *input* schema validates the
// raw form strings (RHF works on these); the *output* schema transforms them to
// the typed, cents-based shape the service layer consumes. The server action
// parses with `compraSchema`; the form types itself with `CompraFormInput`.

const lineInputSchema = z.object({
  insumoId: z.string().min(1, "Elegí un insumo"),
  qty: z.string().min(1, "Cantidad requerida"),
  unitCost: z.string().min(1, "Costo requerido"),
});

export const compraFormInputSchema = z.object({
  proveedorId: z.string().min(1, "Elegí un proveedor"),
  date: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
  lines: z.array(lineInputSchema).min(1, "Agregá al menos un insumo"),
});
export type CompraFormInput = z.infer<typeof compraFormInputSchema>;

// Validated, typed purchase ready for the service layer. qty → whole units,
// unitCost → cents. Rejects non-positive quantities/costs after coercion.
export const compraSchema = compraFormInputSchema.transform((d, ctx) => {
  const lines = d.lines.map((l, i) => {
    const qty = Number.parseInt(l.qty, 10);
    const unitCost = parsePesosToCents(l.unitCost);
    if (!Number.isInteger(qty) || qty <= 0) {
      ctx.addIssue({ code: "custom", message: "Cantidad inválida", path: ["lines", i, "qty"] });
    }
    if (unitCost <= 0) {
      ctx.addIssue({ code: "custom", message: "Costo inválido", path: ["lines", i, "unitCost"] });
    }
    return { insumoId: l.insumoId, qty, unitCost };
  });
  return {
    proveedorId: d.proveedorId,
    date: new Date(d.date),
    notes: d.notes || undefined,
    lines,
  };
});
export type CompraValues = z.output<typeof compraSchema>;
