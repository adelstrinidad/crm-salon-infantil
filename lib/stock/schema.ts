import { z } from "zod/v4";
import { STOCK_ADJUST_OP_KEYS, resolveAdjust } from "./kinds";

// Two-layer schema: the form works on the input (op + positive qty string); the
// service consumes the transformed { insumoId, kind, delta, reason }.

export const stockAdjustInputSchema = z.object({
  insumoId: z.string().min(1),
  op: z.enum(STOCK_ADJUST_OP_KEYS),
  qty: z.string().min(1, "Cantidad requerida"),
  reason: z.string().optional(),
});
export type StockAdjustInput = z.infer<typeof stockAdjustInputSchema>;

export const stockAdjustSchema = stockAdjustInputSchema.transform((d, ctx) => {
  const qty = Number.parseInt(d.qty, 10);
  if (!Number.isInteger(qty) || qty <= 0) {
    ctx.addIssue({ code: "custom", message: "Cantidad inválida", path: ["qty"] });
    return z.NEVER;
  }
  const { kind, delta } = resolveAdjust(d.op, qty);
  return { insumoId: d.insumoId, kind, delta, reason: d.reason || undefined };
});
export type StockAdjustValues = z.output<typeof stockAdjustSchema>;
