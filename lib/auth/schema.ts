import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 8;

const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);

const passwordsMatch = {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
};
const match = (v: { password: string; confirmPassword: string }) =>
  v.password === v.confirmPassword;

// Reset with the manager approval code — the self-service route for someone
// locked out of the account but present at the venue.
export const managerCodeResetSchema = z
  .object({
    managerCode: z.string().min(1, "El código de encargado es requerido"),
    password,
    confirmPassword: z.string(),
  })
  .refine(match, passwordsMatch);

// Reset through an emailed single-use link.
export const tokenResetSchema = z
  .object({
    token: z.string().min(1, "Enlace inválido"),
    password,
    confirmPassword: z.string(),
  })
  .refine(match, passwordsMatch);

// Change password while logged in — requires the current one.
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "La contraseña actual es requerida"),
    password,
    confirmPassword: z.string(),
  })
  .refine(match, passwordsMatch);

export const requestResetSchema = z.object({
  email: z.string().email("Email inválido"),
});

export type ManagerCodeResetInput = z.infer<typeof managerCodeResetSchema>;
export type TokenResetInput = z.infer<typeof tokenResetSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RequestResetInput = z.infer<typeof requestResetSchema>;
