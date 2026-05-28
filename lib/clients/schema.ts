import { z } from "zod";

export const clientFormSchema = z.object({
  name:    z.string().min(1, "El nombre es requerido"),
  dni:     z.string().optional(),
  phone:   z.string().optional(),
  email:   z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  notes:   z.string().optional(),
});

export type ClientFormInput = z.infer<typeof clientFormSchema>;
