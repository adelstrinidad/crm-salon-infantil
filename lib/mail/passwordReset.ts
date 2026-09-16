import { RESET_TOKEN_TTL_MINUTES } from "@/lib/auth/resetTokens";
import { sendMail, type MailOutcome } from "./send";

export function passwordResetBody(resetUrl: string): string {
  return [
    "Pediste restablecer la contraseña de Salón Infantil.",
    "",
    "Abrí este enlace para elegir una nueva:",
    resetUrl,
    "",
    `El enlace vence en ${RESET_TOKEN_TTL_MINUTES} minutos y se puede usar una sola vez.`,
    "Si no lo pediste, ignorá este mensaje: tu contraseña no cambia.",
  ].join("\n");
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<MailOutcome> {
  return sendMail({
    to,
    subject: "Restablecer contraseña — Salón Infantil",
    text: passwordResetBody(resetUrl),
  });
}
