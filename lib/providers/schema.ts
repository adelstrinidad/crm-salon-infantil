import { z } from "zod";

export const providerFormInputSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  role: z.string().optional(),
  cost: z.string(),
});

export type ProviderFormInput = z.infer<typeof providerFormInputSchema>;

export const providerSchema = providerFormInputSchema.transform((data) => ({
  ...data,
  cost: parseFloat(data.cost ?? "0"),
}));

export type ProviderFormValues = z.output<typeof providerSchema>;
