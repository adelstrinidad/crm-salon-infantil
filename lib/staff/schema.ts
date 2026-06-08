import { z } from "zod";
import { parsePesosToCents } from "@/lib/money";
import { isHalfHourMinutes } from "./hours";

// ── Staff CRUD form ──────────────────────────────────────────────────────────
// Raw form input (strings) validated on the client; the Server Action re-parses
// through `staffSchema`, transforming the pesos string into integer cents.
export const staffFormInputSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  role: z.string().optional(),
  hourlyRate: z.string(),
  active: z.boolean().optional(),
});

export type StaffFormInput = z.infer<typeof staffFormInputSchema>;

export const staffSchema = staffFormInputSchema.transform((data) => ({
  name: data.name,
  role: data.role,
  hourlyRate: parsePesosToCents(data.hourlyRate),
  active: data.active ?? true,
}));

export type StaffFormValues = z.output<typeof staffSchema>;

// ── Staff assignment minutes ─────────────────────────────────────────────────
// Validates minutes for an EventStaff line: a non-negative multiple of 30
// (half-hour granularity, no partial times). Used by the assignment actions.
export const assignmentMinutesSchema = z
  .number()
  .int("Los minutos deben ser un número entero")
  .refine(isHalfHourMinutes, "Las horas deben ir en pasos de 30 minutos");
