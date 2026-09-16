import { describe, it, expect } from "vitest";
import {
  managerCodeResetSchema,
  tokenResetSchema,
  requestResetSchema,
  changeManagerCodeSchema,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_MANAGER_CODE_LENGTH,
  MAX_MANAGER_CODE_LENGTH,
  MAX_EMAIL_LENGTH,
} from "./schema";

const valid = "unaClaveSegura1";
const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);

describe("managerCodeResetSchema", () => {
  it("accepts a code with matching passwords", () => {
    const parsed = managerCodeResetSchema.safeParse({
      managerCode: "codigo-de-prueba",
      password: valid,
      confirmPassword: valid,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects mismatched passwords on the confirm field", () => {
    const parsed = managerCodeResetSchema.safeParse({
      managerCode: "codigo-de-prueba",
      password: valid,
      confirmPassword: `${valid}x`,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].path).toEqual(["confirmPassword"]);
      expect(parsed.error.issues[0].message).toMatch(/no coinciden/i);
    }
  });

  it("rejects a password shorter than the minimum", () => {
    const parsed = managerCodeResetSchema.safeParse({
      managerCode: "codigo-de-prueba",
      password: short,
      confirmPassword: short,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toMatch(new RegExp(`${MIN_PASSWORD_LENGTH}`));
    }
  });

  it("rejects an empty manager code", () => {
    const parsed = managerCodeResetSchema.safeParse({
      managerCode: "",
      password: valid,
      confirmPassword: valid,
    });
    expect(parsed.success).toBe(false);
  });
});

describe("tokenResetSchema", () => {
  it("requires a token", () => {
    expect(
      tokenResetSchema.safeParse({ token: "", password: valid, confirmPassword: valid }).success
    ).toBe(false);
  });

  it("accepts a token with matching passwords", () => {
    expect(
      tokenResetSchema.safeParse({ token: "abc", password: valid, confirmPassword: valid }).success
    ).toBe(true);
  });
});

describe("changeManagerCodeSchema", () => {
  const code = "codigo-nuevo";

  it("accepts the current code plus a matching new one", () => {
    expect(
      changeManagerCodeSchema.safeParse({ currentCode: "actual", code, confirmCode: code }).success
    ).toBe(true);
  });

  it("requires the current code — a session alone must not rotate it", () => {
    expect(
      changeManagerCodeSchema.safeParse({ currentCode: "", code, confirmCode: code }).success
    ).toBe(false);
  });

  it("rejects codes that do not match, on the confirm field", () => {
    const parsed = changeManagerCodeSchema.safeParse({
      currentCode: "actual",
      code,
      confirmCode: `${code}x`,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0].path).toEqual(["confirmCode"]);
  });

  it("rejects a code shorter than the minimum", () => {
    const short = "a".repeat(MIN_MANAGER_CODE_LENGTH - 1);
    expect(
      changeManagerCodeSchema.safeParse({ currentCode: "actual", code: short, confirmCode: short })
        .success
    ).toBe(false);
  });
});

describe("requestResetSchema", () => {
  it.each(["admin@salon.local", "user+tag@example.com"])("accepts %s", (email) => {
    expect(requestResetSchema.safeParse({ email }).success).toBe(true);
  });

  it.each(["", "no-arroba", "a@b"])("rejects %s", (email) => {
    expect(requestResetSchema.safeParse({ email }).success).toBe(false);
  });
});

// Upper bounds keep an unauthenticated caller from making the server run scrypt
// over an arbitrarily long string.
describe("length caps", () => {
  it("accepts a password exactly at the cap", () => {
    const at = "a".repeat(MAX_PASSWORD_LENGTH);
    expect(
      tokenResetSchema.safeParse({ token: "abc", password: at, confirmPassword: at }).success
    ).toBe(true);
  });

  it("rejects a password one character over the cap", () => {
    const over = "a".repeat(MAX_PASSWORD_LENGTH + 1);
    const parsed = tokenResetSchema.safeParse({
      token: "abc",
      password: over,
      confirmPassword: over,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues[0].message).toMatch(/no puede superar/i);
  });

  it("accepts a manager code exactly at the cap", () => {
    const at = "a".repeat(MAX_MANAGER_CODE_LENGTH);
    expect(
      changeManagerCodeSchema.safeParse({ currentCode: "actual", code: at, confirmCode: at }).success
    ).toBe(true);
  });

  it("rejects a manager code one character over the cap", () => {
    const over = "a".repeat(MAX_MANAGER_CODE_LENGTH + 1);
    expect(
      changeManagerCodeSchema.safeParse({ currentCode: "actual", code: over, confirmCode: over })
        .success
    ).toBe(false);
  });

  it("rejects an email over the RFC maximum", () => {
    const local = "a".repeat(MAX_EMAIL_LENGTH);
    expect(requestResetSchema.safeParse({ email: `${local}@salon.local` }).success).toBe(false);
  });
});
