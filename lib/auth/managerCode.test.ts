import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { verifyManagerCode } from "./managerCode";
import { hashPassword } from "./password";
import { __resetAll, RATE_LIMIT } from "./rateLimit";

const ORIGINAL = process.env.MANAGER_CODE_HASH;

beforeEach(async () => {
  __resetAll();
  process.env.MANAGER_CODE_HASH = await hashPassword("codigo-secreto");
});

afterAll(() => {
  process.env.MANAGER_CODE_HASH = ORIGINAL;
});

describe("verifyManagerCode", () => {
  it("accepts the right code", async () => {
    expect(await verifyManagerCode("codigo-secreto")).toEqual({ ok: true });
  });

  it("rejects a wrong code with a generic message", async () => {
    const result = await verifyManagerCode("otro");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/incorrecto/i);
  });

  it("fails closed when the hash is not configured", async () => {
    delete process.env.MANAGER_CODE_HASH;
    const result = await verifyManagerCode("codigo-secreto");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/no configurado/i);
  });

  it("rate-limits after repeated failures and recovers on success reset", async () => {
    for (let i = 0; i < RATE_LIMIT.MAX_ATTEMPTS; i++) {
      await verifyManagerCode("malo");
    }
    const blocked = await verifyManagerCode("codigo-secreto");
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error).toMatch(/Demasiados intentos/i);

    // Window cleared (e.g. expired) → correct code passes and resets the bucket.
    __resetAll();
    expect(await verifyManagerCode("codigo-secreto")).toEqual({ ok: true });
  });

  it("does not count successes against the limit", async () => {
    for (let i = 0; i < RATE_LIMIT.MAX_ATTEMPTS + 2; i++) {
      expect((await verifyManagerCode("codigo-secreto")).ok).toBe(true);
    }
  });
});
