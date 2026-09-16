// The admin credential lives in the User table so it can be rotated from the
// UI (change password, reset by manager code, reset by emailed link).
//
// Bootstrap: ADMIN_EMAIL + ADMIN_PASSWORD_HASH stay in .env as the *initial*
// source only. On a database with no User row, `ensureAdminUser()` materializes
// the row from them; after that the DB is the single source of truth and the
// env hash is ignored (so a rotated password cannot be undone by a stale .env).
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "./password";

export type AuthUser = { id: string; email: string; passwordHash: string };

// A throwaway hash used when the email does not match any user, so a failed
// login costs the same scrypt work as a successful one and response time does
// not reveal whether the email exists.
let dummyHashPromise: Promise<string> | null = null;
function dummyHash(): Promise<string> {
  dummyHashPromise ??= hashPassword("no-such-user-placeholder");
  return dummyHashPromise;
}

export async function ensureAdminUser(): Promise<AuthUser | null> {
  const existing = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) return existing;

  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || !passwordHash) return null;

  return prisma.user.create({ data: { email, passwordHash } });
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  return prisma.user.findUnique({ where: { email } });
}

// The app is single-admin: password reset and "change password" act on the one
// account without asking which. Returns null on a DB with no user at all.
export async function getSoleUser(): Promise<AuthUser | null> {
  return ensureAdminUser();
}

export async function verifyCredentials(email: string, password: string): Promise<AuthUser | null> {
  await ensureAdminUser();
  const user = await findUserByEmail(email);
  const stored = user?.passwordHash ?? (await dummyHash());
  const ok = await verifyPassword(password, stored);
  return ok && user ? user : null;
}

// Last-resort password recovery, shared by scripts/reset-password.ts: set the
// admin password, creating the account when the database has none yet (a fresh
// install where the seed never ran). Returns which account was touched.
export class NoAdminEmailError extends Error {
  constructor() {
    super("No hay ninguna cuenta y no se indicó un email (ni ADMIN_EMAIL en .env)");
    this.name = "NoAdminEmailError";
  }
}

export async function resetAdminPassword(
  password: string,
  fallbackEmail?: string
): Promise<{ email: string; created: boolean }> {
  const existing = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (existing) {
    await setUserPassword(existing.id, password);
    return { email: existing.email, created: false };
  }

  const email = fallbackEmail || process.env.ADMIN_EMAIL;
  if (!email) throw new NoAdminEmailError();

  const user = await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });
  return { email: user.email, created: true };
}

// Change the login email. Outstanding reset links are dropped: a link issued
// for the old address must not keep working after the account moves.
export class EmailTakenError extends Error {
  constructor(email: string) {
    super(`Ya existe una cuenta con el email ${email}`);
    this.name = "EmailTakenError";
  }
}

export async function setUserEmail(userId: string, email: string): Promise<AuthUser> {
  const taken = await prisma.user.findUnique({ where: { email } });
  if (taken && taken.id !== userId) throw new EmailTakenError(email);

  const [updated] = await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { email } }),
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
  ]);
  return updated;
}

// Rotate the password and invalidate every outstanding reset link for that
// user — a completed reset (by any route) must not leave a second live link.
export async function setUserPassword(userId: string, newPassword: string): Promise<void> {
  const passwordHash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
  ]);
}
