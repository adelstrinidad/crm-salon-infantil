// Manager approval code for sensitive floor operations (voiding consumption
// lines). Single shared code until the app grows multi-user accounts.
//
// Storage: MANAGER_CODE_HASH env var, scrypt "salt:hash" format — the same
// scheme as ADMIN_PASSWORD_HASH (generate with hashPassword from password.ts).
// The plaintext code is never persisted or logged.
//
// Brute-force defense: attempts share the in-memory fixed-window rate limiter
// used by login (5 failures / 15 min). The key is global rather than per-IP —
// the dashboard is a single-tenant authenticated surface, so one bucket is
// enough to stop guessing without punishing the venue for long.

import { verifyPassword } from "./password";
import { checkRateLimit, recordFailure, reset } from "./rateLimit";

const RATE_KEY = "manager-code";

export type ManagerCodeResult = { ok: true } | { ok: false; error: string };

export async function verifyManagerCode(code: string): Promise<ManagerCodeResult> {
  const stored = process.env.MANAGER_CODE_HASH;
  if (!stored) {
    return {
      ok: false,
      error: "Código de encargado no configurado (MANAGER_CODE_HASH)",
    };
  }

  const limit = checkRateLimit(RATE_KEY);
  if (!limit.allowed) {
    const minutes = Math.ceil(limit.retryAfterSeconds / 60);
    return {
      ok: false,
      error: `Demasiados intentos. Probá de nuevo en ${minutes} min.`,
    };
  }

  const valid = await verifyPassword(code, stored);
  if (!valid) {
    recordFailure(RATE_KEY);
    return { ok: false, error: "Código de encargado incorrecto" };
  }

  reset(RATE_KEY);
  return { ok: true };
}
