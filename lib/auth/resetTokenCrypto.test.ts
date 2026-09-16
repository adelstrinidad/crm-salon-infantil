import { describe, it, expect } from "vitest";
import {
  generateResetToken,
  hashResetToken,
  resetTokenExpiry,
  isResetTokenUsable,
  RESET_TOKEN_TTL_MINUTES,
} from "./resetTokenCrypto";

describe("generateResetToken", () => {
  it("returns 64 hex chars (32 random bytes)", () => {
    expect(generateResetToken()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("does not repeat", () => {
    const tokens = new Set(Array.from({ length: 50 }, generateResetToken));
    expect(tokens.size).toBe(50);
  });
});

describe("hashResetToken", () => {
  it("is deterministic for the same token", () => {
    const token = generateResetToken();
    expect(hashResetToken(token)).toBe(hashResetToken(token));
  });

  it("differs between tokens and never returns the token itself", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(hashResetToken(a)).not.toBe(hashResetToken(b));
    expect(hashResetToken(a)).not.toBe(a);
  });
});

describe("resetTokenExpiry", () => {
  it("is TTL minutes after the given instant", () => {
    const now = new Date("2026-06-01T12:00:00Z");
    expect(resetTokenExpiry(now).getTime() - now.getTime()).toBe(RESET_TOKEN_TTL_MINUTES * 60_000);
  });
});

describe("isResetTokenUsable", () => {
  const now = new Date("2026-06-01T12:00:00Z");
  const future = new Date("2026-06-01T12:30:00Z");
  const past = new Date("2026-06-01T11:30:00Z");

  it("accepts an unused, unexpired token", () => {
    expect(isResetTokenUsable({ expiresAt: future, usedAt: null }, now)).toBe(true);
  });

  it("rejects an expired token", () => {
    expect(isResetTokenUsable({ expiresAt: past, usedAt: null }, now)).toBe(false);
  });

  it("rejects an already used token even if unexpired", () => {
    expect(isResetTokenUsable({ expiresAt: future, usedAt: past }, now)).toBe(false);
  });

  it("rejects a token expiring exactly now", () => {
    expect(isResetTokenUsable({ expiresAt: now, usedAt: null }, now)).toBe(false);
  });
});
