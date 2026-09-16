import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 8;
// Upper bounds exist for the server, not the user: every check runs scrypt over
// whatever arrives, so an unbounded string is CPU the caller can spend for free
// (login is unauthenticated). The caps are far above any real secret.
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_EMAIL_LENGTH = 254; // RFC 5321 maximum

const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
  .max(MAX_PASSWORD_LENGTH, `La contraseña no puede superar los ${MAX_PASSWORD_LENGTH} caracteres`);

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

// Rotating the manager code requires the CURRENT one: it is the second factor
// that authorizes voids and payment reversals, so a logged-in session alone must
// not be enough to replace it.
export const MIN_MANAGER_CODE_LENGTH = 6;
export const MAX_MANAGER_CODE_LENGTH = 64;

const managerCode = z
  .string()
  .min(MIN_MANAGER_CODE_LENGTH, `El código debe tener al menos ${MIN_MANAGER_CODE_LENGTH} caracteres`)
  .max(MAX_MANAGER_CODE_LENGTH, `El código no puede superar los ${MAX_MANAGER_CODE_LENGTH} caracteres`);

export const changeManagerCodeSchema = z
  .object({
    currentCode: z.string().min(1, "El código actual es requerido"),
    code: managerCode,
    confirmCode: z.string(),
  })
  .refine((v) => v.code === v.confirmCode, {
    message: "Los códigos no coinciden",
    path: ["confirmCode"],
  });

// Setting the manager code through an emailed link: no current code, the link
// itself is the proof.
export const managerCodeTokenSchema = z
  .object({
    token: z.string().min(1, "Enlace inválido"),
    code: managerCode,
    confirmCode: z.string(),
  })
  .refine((v) => v.code === v.confirmCode, {
    message: "Los códigos no coinciden",
    path: ["confirmCode"],
  });

export const requestResetSchema = z.object({
  email: z.string().email("Email inválido").max(MAX_EMAIL_LENGTH, "Email inválido"),
});

export type ManagerCodeResetInput = z.infer<typeof managerCodeResetSchema>;
export type TokenResetInput = z.infer<typeof tokenResetSchema>;
export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type ChangeManagerCodeInput = z.infer<typeof changeManagerCodeSchema>;
export type ManagerCodeTokenInput = z.infer<typeof managerCodeTokenSchema>;
