// RHF + Zod v4 note: z.coerce.* has input type `unknown` which breaks the Resolver type.
// Rule: use plain z.string() in the form schema (what HTML sends), coerce/transform in eventSchema.

import { z } from "zod";

export const EventState = {
  PRESUPUESTADO: "PRESUPUESTADO",
  RESERVADO: "RESERVADO",
  SENADO: "SENADO",
  PAGADO: "PAGADO",
  CERRADO: "CERRADO",
  SUSPENDIDO: "SUSPENDIDO",
} as const;

export type EventState = (typeof EventState)[keyof typeof EventState];

// ── 1. Form input schema — what HTML inputs actually send (all strings) ───────
export const eventFormInputSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  eventType: z.string().min(1, "El tipo de evento es requerido"),
  clientName: z.string().min(1, "El nombre del cliente es requerido"),
  clientId: z.string().optional(),
  startAt: z.string().min(1, "La fecha de inicio es requerida"),
  endAt: z.string().min(1, "La fecha de fin es requerida"),
  state: z.nativeEnum(EventState),
  details: z.string().optional(),
  notes: z.string().optional(),
  totalPrice: z.string(), // string from <input type="number">; default "0" set in form defaultValues
});

export type EventFormInput = z.infer<typeof eventFormInputSchema>;

// ── 2. Server schema — transforms form strings into proper types for the service ─
export const eventSchema = eventFormInputSchema.transform((data) => ({
  ...data,
  startAt: new Date(data.startAt),
  endAt: new Date(data.endAt),
  totalPrice: parseFloat(data.totalPrice ?? "0"),
}));

export type EventFormValues = z.output<typeof eventSchema>;
