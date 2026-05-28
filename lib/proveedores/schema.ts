import { z } from "zod/v4";

export const proveedorSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

export type ProveedorFormValues = z.infer<typeof proveedorSchema>;
