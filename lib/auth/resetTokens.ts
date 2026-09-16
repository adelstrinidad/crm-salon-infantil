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

// What a link is allowed to change. A token issued for one purpose must never
// work for the other: an emailed password link must not be able to rotate the
// manager code, which is the factor that authorizes voids and reversals.
export const RESET_PURPOSE = {
  password: "password",
  managerCode: "manager-code",
} as const;
export type ResetPurpose = (typeof RESET_PURPOSE)[keyof typeof RESET_PURPOSE];

const INVALID = "El enlace no es válido o ya expiró. Pedí uno nuevo.";

// Issue a fresh link for a user. Any outstanding token of the SAME purpose is
// dropped first, so a new request invalidates the previous email (one live link
// per purpose) without killing a pending link of the other kind.
export async function createResetToken(
  userId: string,
  purpose: ResetPurpose = RESET_PURPOSE.password
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateResetToken();
  const expiresAt = resetTokenExpiry();
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId, purpose } }),
    prisma.passwordResetToken.create({
      data: { tokenHash: hashResetToken(token), userId, expiresAt, purpose },
    }),
  ]);
  return { token, expiresAt };
}

// Look the token up without spending it — used to decide whether to render the
// "new password" form or the "expired link" notice.
export async function checkResetToken(
  token: string,
  purpose: ResetPurpose = RESET_PURPOSE.password
): Promise<ConsumeResult> {
  const row = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!row || row.purpose !== purpose || !isResetTokenUsable(row)) {
    return { ok: false, error: INVALID };
  }
  return { ok: true, userId: row.userId };
}

// Spend the token. The `usedAt: null` guard on updateMany makes the spend
// atomic: two concurrent submits cannot both succeed.
export async function consumeResetToken(
  token: string,
  purpose: ResetPurpose = RESET_PURPOSE.password
): Promise<ConsumeResult> {
  const tokenHash = hashResetToken(token);
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.purpose !== purpose || !isResetTokenUsable(row)) {
    return { ok: false, error: INVALID };
  }

  const spent = await prisma.passwordResetToken.updateMany({
    where: { tokenHash, purpose, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (spent.count === 0) return { ok: false, error: INVALID };

  return { ok: true, userId: row.userId };
}
