import { describe, it, expect } from "vitest";
import {
  managerCodeResetSchema,
  tokenResetSchema,
  changePasswordSchema,
  requestResetSchema,
  MIN_PASSWORD_LENGTH,
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

describe("changePasswordSchema", () => {
  it("requires the current password", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "",
        password: valid,
        confirmPassword: valid,
      }).success
    ).toBe(false);
  });

  it("accepts a full valid change", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "vieja1234",
        password: valid,
        confirmPassword: valid,
      }).success
    ).toBe(true);
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
