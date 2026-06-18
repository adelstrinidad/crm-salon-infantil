import { z } from "zod";
import { REVERSAL_REASON_KEYS } from "./reversalReasons";

// The four payable line kinds a reversal can target.
export const REVERSAL_KINDS = [
  "event-provider",
  "service",
  "staff",
  "compra",
] as const;

// Input for "Anular pago": which line, plus the manager code and a reason. Free
// text is required only when reason = "otro" (mirrors the consumos void schema).
export const reversalSchema = z
  .object({
    kind: z.enum(REVERSAL_KINDS),
    id: z.string().min(1),
    managerCode: z.string().min(1, "Ingresá el código del encargado"),
    reason: z.enum(REVERSAL_REASON_KEYS),
    reasonText: z.string().optional(),
  })
  .refine((v) => v.reason !== "otro" || !!v.reasonText?.trim(), {
    message: "Detallá el motivo",
    path: ["reasonText"],
  });

export type ReversalValues = z.infer<typeof reversalSchema>;
