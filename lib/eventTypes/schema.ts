import { z } from "zod";

export const eventTypeFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export type EventTypeFormInput = z.infer<typeof eventTypeFormSchema>;
