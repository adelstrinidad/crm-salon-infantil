import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { prisma, resetDb } from "./setup/db";
import { hashPassword } from "@/lib/auth/password";
import {
  getManagerCodeHash,
  setManagerCode,
  MANAGER_CODE_KEY,
} from "@/lib/auth/managerCodeStore";
import { verifyManagerCode } from "@/lib/auth/managerCode";
import {
  changeManagerCodeAction,
  resetManagerCodeWithTokenAction,
  resetWithTokenAction,
} from "@/lib/auth/actions";
import { createResetToken, checkResetToken, RESET_PURPOSE } from "@/lib/auth/resetTokens";
import { ensureAdminUser, verifyCredentials } from "@/lib/auth/userService";
import { __resetAll } from "@/lib/auth/rateLimit";

// changeManagerCodeAction guards with requireSession(), which reads the request
// cookies — there is no request here. The guard itself is covered by the e2e
// suite (an unauthenticated visit to /cuenta redirects to /login); these tests
// exercise what the action does once past it.
vi.mock("@/lib/auth/session", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session")>()),
  requireSession: async () => ({ authenticated: true }),
}));

const CODE = "encargado-inicial";

beforeEach(async () => {
  await resetDb();
  __resetAll(); // the manager-code rate limiter is global and in-memory
  vi.stubEnv("MANAGER_CODE_HASH", await hashPassword(CODE));
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getManagerCodeHash", () => {
  it("materializes the env bootstrap into AppSetting on first use", async () => {
    expect(await prisma.appSetting.count()).toBe(0);

    const hash = await getManagerCodeHash();

    expect(hash).toBe(process.env.MANAGER_CODE_HASH);
    const row = await prisma.appSetting.findUnique({ where: { key: MANAGER_CODE_KEY } });
    expect(row?.value).toBe(hash);
  });

  it("does not resurrect the env value after a rotation", async () => {
    await getManagerCodeHash(); // bootstrap
    await setManagerCode("codigo-rotado");

    // env still carries the ORIGINAL hash
    expect(await verifyManagerCode("codigo-rotado")).toEqual({ ok: true });
    expect((await verifyManagerCode(CODE)).ok).toBe(false);
  });

  it("returns undefined with no row and no env bootstrap", async () => {
    vi.stubEnv("MANAGER_CODE_HASH", "");
    expect(await getManagerCodeHash()).toBeUndefined();
  });
});

describe("changeManagerCodeAction", () => {
  it("rotates the code when the current one is right", async () => {
    const result = await changeManagerCodeAction({
      currentCode: CODE,
      code: "codigo-nuevo",
      confirmCode: "codigo-nuevo",
    });

    expect(result).toEqual({ ok: true });
    expect(await verifyManagerCode("codigo-nuevo")).toEqual({ ok: true });
  });

  it("refuses a wrong current code and leaves the old one working", async () => {
    const result = await changeManagerCodeAction({
      currentCode: "no-es-el-actual",
      code: "codigo-nuevo",
      confirmCode: "codigo-nuevo",
    });

    expect(result.ok).toBe(false);
    __resetAll(); // the failed attempt consumed a rate-limit slot
    expect(await verifyManagerCode(CODE)).toEqual({ ok: true });
  });

  it("refuses codes that do not match, without touching the stored one", async () => {
    const result = await changeManagerCodeAction({
      currentCode: CODE,
      code: "codigo-nuevo",
      confirmCode: "otro-codigo",
    });

    expect(result.ok).toBe(false);
    expect(await verifyManagerCode(CODE)).toEqual({ ok: true });
  });

  it("stores a hash, never the plaintext code", async () => {
    await changeManagerCodeAction({
      currentCode: CODE,
      code: "codigo-nuevo",
      confirmCode: "codigo-nuevo",
    });

    const row = await prisma.appSetting.findUnique({ where: { key: MANAGER_CODE_KEY } });
    expect(row!.value).not.toContain("codigo-nuevo");
    expect(row!.value).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });
});

describe("manager code recovery by emailed link", () => {
  const PASSWORD = "claveInicial1";
  const EMAIL = "admin@salon.local";

  async function seedAdmin() {
    vi.stubEnv("ADMIN_EMAIL", EMAIL);
    vi.stubEnv("ADMIN_PASSWORD_HASH", await hashPassword(PASSWORD));
    const user = await ensureAdminUser();
    return user!;
  }

  it("sets the code without asking for the current one", async () => {
    const user = await seedAdmin();
    const { token } = await createResetToken(user.id, RESET_PURPOSE.managerCode);

    const result = await resetManagerCodeWithTokenAction({
      token,
      code: "codigo-por-mail",
      confirmCode: "codigo-por-mail",
    });

    expect(result).toEqual({ ok: true });
    expect(await verifyManagerCode("codigo-por-mail")).toEqual({ ok: true });
  });

  it("refuses a password-reset link — purposes are not interchangeable", async () => {
    const user = await seedAdmin();
    const { token } = await createResetToken(user.id, RESET_PURPOSE.password);

    const result = await resetManagerCodeWithTokenAction({
      token,
      code: "codigo-por-mail",
      confirmCode: "codigo-por-mail",
    });

    expect(result.ok).toBe(false);
    expect(await verifyManagerCode(CODE)).toEqual({ ok: true });
  });

  it("refuses a manager-code link as a password reset", async () => {
    const user = await seedAdmin();
    const { token } = await createResetToken(user.id, RESET_PURPOSE.managerCode);

    const result = await resetWithTokenAction({
      token,
      password: "claveNueva77",
      confirmPassword: "claveNueva77",
    });

    expect(result.ok).toBe(false);
    expect(await verifyCredentials(EMAIL, PASSWORD)).not.toBeNull();
  });

  it("keeps one live link per purpose — issuing one does not kill the other", async () => {
    const user = await seedAdmin();
    const password = await createResetToken(user.id, RESET_PURPOSE.password);
    const managerCode = await createResetToken(user.id, RESET_PURPOSE.managerCode);

    expect(await checkResetToken(password.token, RESET_PURPOSE.password)).toMatchObject({ ok: true });
    expect(await checkResetToken(managerCode.token, RESET_PURPOSE.managerCode)).toMatchObject({
      ok: true,
    });
  });

  it("is single use", async () => {
    const user = await seedAdmin();
    const { token } = await createResetToken(user.id, RESET_PURPOSE.managerCode);
    const input = { token, code: "codigo-por-mail", confirmCode: "codigo-por-mail" };

    expect(await resetManagerCodeWithTokenAction(input)).toEqual({ ok: true });
    expect((await resetManagerCodeWithTokenAction(input)).ok).toBe(false);
  });

  it("rotating the code kills any outstanding manager-code link", async () => {
    const user = await seedAdmin();
    const { token } = await createResetToken(user.id, RESET_PURPOSE.managerCode);

    await changeManagerCodeAction({
      currentCode: CODE,
      code: "codigo-nuevo",
      confirmCode: "codigo-nuevo",
    });

    expect(await checkResetToken(token, RESET_PURPOSE.managerCode)).toMatchObject({ ok: false });
  });
});
