// Emailed password-reset links (database side; the pure helpers live in
// resetTokenCrypto.ts).
//
// A token is single use (usedAt) and short lived (RESET_TOKEN_TTL_MINUTES).
// Completing a reset by any route deletes the user's remaining tokens (see
// setUserPassword), so a live link cannot outlive the password it would reset.
import { prisma } from "@/lib/prisma";
import {
  generateResetToken,
  hashResetToken,
  resetTokenExpiry,
  isResetTokenUsable,
} from "./resetTokenCrypto";

export {
  RESET_TOKEN_TTL_MINUTES,
  generateResetToken,
  hashResetToken,
  resetTokenExpiry,
  isResetTokenUsable,
} from "./resetTokenCrypto";

export type ConsumeResult = { ok: true; userId: string } | { ok: false; error: string };

const INVALID = "El enlace no es válido o ya expiró. Pedí uno nuevo.";

// Issue a fresh link for a user. Any outstanding token is dropped first, so a
// new request invalidates the previous email (one live link at a time).
export async function createResetToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateResetToken();
  const expiresAt = resetTokenExpiry();
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({
      data: { tokenHash: hashResetToken(token), userId, expiresAt },
    }),
  ]);
  return { token, expiresAt };
}

// Look the token up without spending it — used to decide whether to render the
// "new password" form or the "expired link" notice.
export async function checkResetToken(token: string): Promise<ConsumeResult> {
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!row || !isResetTokenUsable(row)) return { ok: false, error: INVALID };
  return { ok: true, userId: row.userId };
}

// Spend the token. The `usedAt: null` guard on updateMany makes the spend
// atomic: two concurrent submits cannot both succeed.
export async function consumeResetToken(token: string): Promise<ConsumeResult> {
  const tokenHash = hashResetToken(token);
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || !isResetTokenUsable(row)) return { ok: false, error: INVALID };

  const spent = await prisma.passwordResetToken.updateMany({
    where: { tokenHash, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (spent.count === 0) return { ok: false, error: INVALID };

  return { ok: true, userId: row.userId };
}
