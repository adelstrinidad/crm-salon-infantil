"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, deleteSession, requireSession } from "./session";
import { verifyPassword } from "./password";
import { checkRateLimit, recordFailure, reset } from "./rateLimit";
import { verifyManagerCode } from "./managerCode";
import {
  managerCodeResetSchema,
  tokenResetSchema,
  changePasswordSchema,
  requestResetSchema,
  type ManagerCodeResetInput,
  type TokenResetInput,
  type ChangePasswordInput,
  type RequestResetInput,
} from "./schema";
import { verifyCredentials, getSoleUser, setUserPassword, findUserByEmail } from "./userService";
import { createResetToken, consumeResetToken } from "./resetTokens";
import { sendPasswordResetEmail } from "@/lib/mail/passwordReset";

// Derive a rate-limit key from the client IP. Behind a proxy/CDN the real IP
// is the first entry of x-forwarded-for; fall back to a constant so the limit
// still applies (globally) when no IP header is present.
async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

// Absolute origin for links inside emails. APP_URL wins (the only value that is
// correct behind a proxy or in a queued job); otherwise fall back to the host
// the request came in on.
async function appOrigin(): Promise<string> {
  const configured = process.env.APP_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function tooManyAttempts(retryAfterSeconds: number): string {
  const mins = Math.ceil(retryAfterSeconds / 60);
  return `Demasiados intentos. Probá de nuevo en ${mins} minuto${mins !== 1 ? "s" : ""}.`;
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Credenciales incorrectas" };
  }

  const key = `login:${await clientIp()}`;
  const limit = checkRateLimit(key);
  if (!limit.allowed) return { error: tooManyAttempts(limit.retryAfterSeconds) };

  // verifyCredentials hashes even when the email is unknown, so response time
  // does not reveal whether the account exists.
  const user = await verifyCredentials(email, password);
  if (!user) {
    recordFailure(key);
    return { error: "Credenciales incorrectas" };
  }

  reset(key); // successful login clears the failure counter
  await createSession();
  redirect("/eventos");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

// ─── Password recovery ────────────────────────────────────────────────────────

export type ResetResult = { ok: true } | { ok: false; error: string };

// Every action below re-validates its input with the same Zod schema the form
// uses on the client: the client check is for UX (no round trip on a typo),
// this one is the trust boundary.

// Route 1 — manager approval code. For the venue that lost the password but
// still knows the code; needs no email infrastructure. verifyManagerCode
// applies its own (global) rate limit.
export async function resetWithManagerCodeAction(
  input: ManagerCodeResetInput
): Promise<ResetResult> {
  const parsed = managerCodeResetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const code = await verifyManagerCode(parsed.data.managerCode);
  if (!code.ok) return { ok: false, error: code.error };

  const user = await getSoleUser();
  if (!user) {
    return { ok: false, error: "No hay una cuenta configurada. Contactá al administrador." };
  }

  await setUserPassword(user.id, parsed.data.password);
  return { ok: true };
}

// Route 2 — emailed single-use link. The answer is identical whether or not the
// address matches an account (no enumeration) and whether or not mail is
// configured; an unconfigured install logs the link to the server console.
export async function requestPasswordResetAction(input: RequestResetInput): Promise<ResetResult> {
  const parsed = requestResetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const key = `reset-request:${await clientIp()}`;
  const limit = checkRateLimit(key);
  if (!limit.allowed) return { ok: false, error: tooManyAttempts(limit.retryAfterSeconds) };
  recordFailure(key); // every request counts — this endpoint has no "success"

  const user = await findUserByEmail(parsed.data.email);
  if (user) {
    const { token } = await createResetToken(user.id);
    const url = `${await appOrigin()}/recuperar/${token}`;
    await sendPasswordResetEmail(user.email, url);
  }
  return { ok: true };
}

// Route 2, step 2 — spend the link and set the new password.
//
// Validation runs BEFORE consuming: a rejected password (too short, mismatched)
// must not burn the single-use link, or a typo would force the user to request
// a new email.
export async function resetWithTokenAction(input: TokenResetInput): Promise<ResetResult> {
  const parsed = tokenResetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const consumed = await consumeResetToken(parsed.data.token);
  if (!consumed.ok) return { ok: false, error: consumed.error };

  await setUserPassword(consumed.userId, parsed.data.password);
  return { ok: true };
}

// Route 3 — change the password while logged in (knows the current one).
export async function changePasswordAction(input: ChangePasswordInput): Promise<ResetResult> {
  await requireSession();

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const user = await getSoleUser();
  if (!user) return { ok: false, error: "No hay una cuenta configurada." };

  const currentOk = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!currentOk) return { ok: false, error: "La contraseña actual es incorrecta" };

  await setUserPassword(user.id, parsed.data.password);
  return { ok: true };
}
