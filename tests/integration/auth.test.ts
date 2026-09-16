import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prisma, resetDb } from "./setup/db";
import { hashPassword } from "@/lib/auth/password";
import {
  ensureAdminUser,
  findUserByEmail,
  getSoleUser,
  verifyCredentials,
  setUserPassword,
  setUserEmail,
  EmailTakenError,
  resetAdminPassword,
  NoAdminEmailError,
} from "@/lib/auth/userService";
import { resetWithTokenAction } from "@/lib/auth/actions";
import {
  createResetToken,
  checkResetToken,
  consumeResetToken,
  hashResetToken,
} from "@/lib/auth/resetTokens";

const EMAIL = "admin@salon.local";
const PASSWORD = "claveInicial1";

async function stubAdminEnv() {
  vi.stubEnv("ADMIN_EMAIL", EMAIL);
  vi.stubEnv("ADMIN_PASSWORD_HASH", await hashPassword(PASSWORD));
}

beforeEach(async () => {
  await resetDb();
  await stubAdminEnv();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("ensureAdminUser", () => {
  it("materializes the admin row from the env bootstrap values", async () => {
    const user = await ensureAdminUser();
    expect(user?.email).toBe(EMAIL);
    expect(await prisma.user.count()).toBe(1);
  });

  it("is idempotent — a second call does not create a second user", async () => {
    const first = await ensureAdminUser();
    const second = await ensureAdminUser();
    expect(second?.id).toBe(first?.id);
    expect(await prisma.user.count()).toBe(1);
  });

  it("does not overwrite a rotated password with the stale env hash", async () => {
    const user = await ensureAdminUser();
    await setUserPassword(user!.id, "claveRotada9");

    await ensureAdminUser(); // env still carries the ORIGINAL hash

    expect(await verifyCredentials(EMAIL, "claveRotada9")).not.toBeNull();
    expect(await verifyCredentials(EMAIL, PASSWORD)).toBeNull();
  });

  it("returns null when no user exists and no env bootstrap is configured", async () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    vi.stubEnv("ADMIN_PASSWORD_HASH", "");
    expect(await ensureAdminUser()).toBeNull();
  });
});

describe("verifyCredentials", () => {
  it("accepts the right email and password", async () => {
    const user = await verifyCredentials(EMAIL, PASSWORD);
    expect(user?.email).toBe(EMAIL);
  });

  it("rejects a wrong password", async () => {
    expect(await verifyCredentials(EMAIL, "otraClave123")).toBeNull();
  });

  it("rejects an unknown email", async () => {
    expect(await verifyCredentials("nadie@salon.local", PASSWORD)).toBeNull();
  });
});

describe("setUserPassword", () => {
  it("rotates the password so only the new one works", async () => {
    const user = await getSoleUser();
    await setUserPassword(user!.id, "claveNueva77");

    expect(await verifyCredentials(EMAIL, "claveNueva77")).not.toBeNull();
    expect(await verifyCredentials(EMAIL, PASSWORD)).toBeNull();
  });

  it("stores a hash, never the plaintext", async () => {
    const user = await getSoleUser();
    await setUserPassword(user!.id, "claveNueva77");
    const stored = await findUserByEmail(EMAIL);
    expect(stored!.passwordHash).not.toContain("claveNueva77");
    expect(stored!.passwordHash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it("invalidates outstanding reset links", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);

    await setUserPassword(user!.id, "claveNueva77");

    expect(await checkResetToken(token)).toMatchObject({ ok: false });
  });
});

describe("resetAdminPassword (CLI escape hatch)", () => {
  it("rotates the password of the existing account", async () => {
    await ensureAdminUser();
    const result = await resetAdminPassword("claveCli1234");

    expect(result).toEqual({ email: EMAIL, created: false });
    expect(await verifyCredentials(EMAIL, "claveCli1234")).not.toBeNull();
  });

  it("creates the account from the given email when the DB has none", async () => {
    const result = await resetAdminPassword("claveCli1234", "dueno@salon.local");

    expect(result).toEqual({ email: "dueno@salon.local", created: true });
    expect(await verifyCredentials("dueno@salon.local", "claveCli1234")).not.toBeNull();
  });

  it("falls back to ADMIN_EMAIL when no email is given and no account exists", async () => {
    const result = await resetAdminPassword("claveCli1234");
    expect(result).toEqual({ email: EMAIL, created: true });
  });

  it("fails when there is no account and no email to use", async () => {
    vi.stubEnv("ADMIN_EMAIL", "");
    await expect(resetAdminPassword("claveCli1234")).rejects.toBeInstanceOf(NoAdminEmailError);
  });

  it("never creates a second account", async () => {
    await ensureAdminUser();
    await resetAdminPassword("claveCli1234", "otro@salon.local");
    expect(await prisma.user.count()).toBe(1);
  });
});

describe("setUserEmail", () => {
  it("moves the login to the new address and keeps the password", async () => {
    const user = await getSoleUser();
    const updated = await setUserEmail(user!.id, "nuevo@salon.local");

    expect(updated.email).toBe("nuevo@salon.local");
    expect(await verifyCredentials("nuevo@salon.local", PASSWORD)).not.toBeNull();
    expect(await verifyCredentials(EMAIL, PASSWORD)).toBeNull();
  });

  it("does not create a second account", async () => {
    const user = await getSoleUser();
    await setUserEmail(user!.id, "nuevo@salon.local");
    expect(await prisma.user.count()).toBe(1);
  });

  it("invalidates links issued for the old address", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);

    await setUserEmail(user!.id, "nuevo@salon.local");

    expect(await checkResetToken(token)).toMatchObject({ ok: false });
  });

  it("accepts setting the same email again (no-op)", async () => {
    const user = await getSoleUser();
    const updated = await setUserEmail(user!.id, EMAIL);
    expect(updated.email).toBe(EMAIL);
  });

  it("refuses an address another account already uses", async () => {
    const user = await getSoleUser();
    const other = await prisma.user.create({
      data: { email: "otro@salon.local", passwordHash: await hashPassword("otraClave1") },
    });

    await expect(setUserEmail(user!.id, other.email)).rejects.toBeInstanceOf(EmailTakenError);
    expect(await findUserByEmail(EMAIL)).not.toBeNull();
  });
});

describe("resetWithTokenAction — the link survives a bad password", () => {
  // Regression: a rejected password must NOT burn the single-use link. Spending
  // it on a typo would force the user to request a whole new email.
  it("keeps the link usable when the confirmation does not match", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);

    const result = await resetWithTokenAction({
      token,
      password: "claveNueva77",
      confirmPassword: "otraCosa123",
    });

    expect(result).toMatchObject({ ok: false });
    expect(await checkResetToken(token)).toMatchObject({ ok: true, userId: user!.id });
    expect(await verifyCredentials(EMAIL, PASSWORD)).not.toBeNull();
  });

  it("keeps the link usable when the password is too short", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);

    const result = await resetWithTokenAction({ token, password: "corta", confirmPassword: "corta" });

    expect(result).toMatchObject({ ok: false });
    expect(await checkResetToken(token)).toMatchObject({ ok: true });
  });

  it("lets the user retry successfully on the same link after a failed attempt", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);

    await resetWithTokenAction({ token, password: "claveNueva77", confirmPassword: "noCoincide1" });
    const retry = await resetWithTokenAction({
      token,
      password: "claveNueva77",
      confirmPassword: "claveNueva77",
    });

    expect(retry).toMatchObject({ ok: true });
    expect(await verifyCredentials(EMAIL, "claveNueva77")).not.toBeNull();
  });

  it("spends the link on success, so a replay is refused", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);

    await resetWithTokenAction({
      token,
      password: "claveNueva77",
      confirmPassword: "claveNueva77",
    });
    const replay = await resetWithTokenAction({
      token,
      password: "otraClave999",
      confirmPassword: "otraClave999",
    });

    expect(replay).toMatchObject({ ok: false });
    expect(await verifyCredentials(EMAIL, "claveNueva77")).not.toBeNull();
  });
});

describe("password reset tokens", () => {
  it("stores only the token hash, never the token", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);

    const row = await prisma.passwordResetToken.findFirst();
    expect(row!.tokenHash).toBe(hashResetToken(token));
    expect(row!.tokenHash).not.toBe(token);
  });

  it("keeps only one live token per user — a new request replaces the old link", async () => {
    const user = await getSoleUser();
    const first = await createResetToken(user!.id);
    const second = await createResetToken(user!.id);

    expect(await prisma.passwordResetToken.count()).toBe(1);
    expect(await checkResetToken(first.token)).toMatchObject({ ok: false });
    expect(await checkResetToken(second.token)).toMatchObject({ ok: true, userId: user!.id });
  });

  it("checkResetToken does not spend the token", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);

    await checkResetToken(token);

    expect(await consumeResetToken(token)).toMatchObject({ ok: true, userId: user!.id });
  });

  it("consumeResetToken works once — the second attempt is refused", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);

    expect(await consumeResetToken(token)).toMatchObject({ ok: true });
    const second = await consumeResetToken(token);
    expect(second.ok).toBe(false);
  });

  it("refuses an expired token", async () => {
    const user = await getSoleUser();
    const { token } = await createResetToken(user!.id);
    await prisma.passwordResetToken.updateMany({
      data: { expiresAt: new Date(Date.now() - 60_000) },
    });

    expect(await checkResetToken(token)).toMatchObject({ ok: false });
    expect(await consumeResetToken(token)).toMatchObject({ ok: false });
  });

  it("refuses a token that was never issued", async () => {
    expect(await checkResetToken("deadbeef")).toMatchObject({ ok: false });
  });

  it("is deleted with its user", async () => {
    const user = await getSoleUser();
    await createResetToken(user!.id);
    await prisma.user.delete({ where: { id: user!.id } });
    expect(await prisma.passwordResetToken.count()).toBe(0);
  });
});
