import { z } from "zod";
import { parsePesosToCents } from "@/lib/money";

export const serviceFormInputSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  cost: z.string(),
  price: z.string(),
  proveedorId: z.string().optional(),
});

export type ServiceFormInput = z.infer<typeof serviceFormInputSchema>;

export const serviceSchema = serviceFormInputSchema.transform((data) => ({
  ...data,
  description: data.description || null,
  cost: parsePesosToCents(data.cost),
  price: parsePesosToCents(data.price),
  proveedorId: data.proveedorId || null,
}));

export type ServiceFormValues = z.output<typeof serviceSchema>;
