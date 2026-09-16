// Pure token helpers for password-reset links — no database, so they unit test
// on their own (see resetTokenCrypto.test.ts). The DB side lives in
// resetTokens.ts.
import { randomBytes, createHash } from "crypto";

export const RESET_TOKEN_TTL_MINUTES = 60;

export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

// Only the hash is persisted: a database leak yields no working link.
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function resetTokenExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + RESET_TOKEN_TTL_MINUTES * 60_000);
}

export function isResetTokenUsable(
  token: { expiresAt: Date; usedAt: Date | null },
  now: Date = new Date()
): boolean {
  if (token.usedAt) return false;
  return token.expiresAt.getTime() > now.getTime();
}
