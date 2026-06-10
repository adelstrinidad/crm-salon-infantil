"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSession, deleteSession } from "./session";
import { verifyPassword } from "./password";
import { checkRateLimit, recordFailure, reset } from "./rateLimit";

// Derive a rate-limit key from the client IP. Behind a proxy/CDN the real IP
// is the first entry of x-forwarded-for; fall back to a constant so the limit
// still applies (globally) when no IP header is present.
async function clientKey(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return `login:${ip}`;
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Credenciales incorrectas" };
  }

  const key = await clientKey();
  const limit = checkRateLimit(key);
  if (!limit.allowed) {
    const mins = Math.ceil(limit.retryAfterSeconds / 60);
    return { error: `Demasiados intentos. Probá de nuevo en ${mins} minuto${mins !== 1 ? "s" : ""}.` };
  }

  const emailOk = email === process.env.ADMIN_EMAIL;
  // Always run the hash verification (even on a wrong email) so response time
  // does not reveal whether the email matched.
  const passwordOk = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);

  if (!emailOk || !passwordOk) {
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
