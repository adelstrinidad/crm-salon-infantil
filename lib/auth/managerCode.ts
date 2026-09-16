// Manager approval code for sensitive floor operations (voiding consumption
// lines). Single shared code until the app grows multi-user accounts.
//
// Storage: the AppSetting row "managerCodeHash" (scrypt "salt:hash", the same
// scheme as the password), bootstrapped once from the MANAGER_CODE_HASH env var
// so it can be rotated from /cuenta — see managerCodeStore.ts.
// The plaintext code is never persisted or logged.
//
// Brute-force defense: attempts share the in-memory fixed-window rate limiter
// used by login (5 failures / 15 min). The key is global rather than per-IP —
// the dashboard is a single-tenant authenticated surface, so one bucket is
// enough to stop guessing without punishing the venue for long.

import { verifyPassword } from "./password";
import { checkRateLimit, recordFailure, reset } from "./rateLimit";
import { getManagerCodeHash } from "./managerCodeStore";

const RATE_KEY = "manager-code";

export type ManagerCodeResult = { ok: true } | { ok: false; error: string };

export async function verifyManagerCode(code: string): Promise<ManagerCodeResult> {
  return checkManagerCode(code, await getManagerCodeHash());
}

// Split from the lookup so the rate-limit and comparison logic stays testable
// without a database (see managerCode.test.ts).
export async function checkManagerCode(
  code: string,
  stored: string | undefined
): Promise<ManagerCodeResult> {
  if (!stored) {
    return {
      ok: false,
      error: "Código de encargado no configurado",
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
