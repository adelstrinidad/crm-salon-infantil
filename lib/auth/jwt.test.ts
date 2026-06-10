import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { SignJWT } from "jose";

// jwt.ts validates AUTH_SECRET at module load, so set it BEFORE importing it
// (dynamic import after the env is in place).
let jwt: typeof import("./jwt");

beforeAll(async () => {
  process.env.AUTH_SECRET = "test-secret-that-is-at-least-32-characters";
  jwt = await import("./jwt");
});

afterEach(() => vi.useRealTimers());

describe("verifyToken", () => {
  it("accepts a freshly signed token and exposes the claims", async () => {
    const token = await jwt.signToken(jwt.freshAbsoluteDeadline());
    const claims = await jwt.verifyToken(token);
    expect(claims?.authenticated).toBe(true);
    expect(typeof claims?.aexp).toBe("number");
  });

  it("rejects a garbage token", async () => {
    expect(await jwt.verifyToken("not.a.jwt")).toBeNull();
  });

  it("rejects a token signed with a different secret (forgery)", async () => {
    const forged = await new SignJWT({ authenticated: true, aexp: jwt.freshAbsoluteDeadline() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + 600)
      .sign(new TextEncoder().encode("a-totally-different-secret-32-chars-xx"));
    expect(await jwt.verifyToken(forged)).toBeNull();
  });

  it("rejects a token whose absolute deadline has passed", async () => {
    // aexp in the past → session is over even if the idle exp is still valid.
    const past = Math.floor(Date.now() / 1000) - 10;
    const token = await jwt.signToken(past);
    expect(await jwt.verifyToken(token)).toBeNull();
  });

  it("rejects once the idle window elapses (no activity)", async () => {
    vi.useFakeTimers();
    const token = await jwt.signToken(jwt.freshAbsoluteDeadline());
    expect(await jwt.verifyToken(token)).not.toBeNull();
    // Advance past the idle window; the JWT `exp` is now in the past.
    vi.advanceTimersByTime((jwt.IDLE_MAX_AGE_SECONDS + 60) * 1000);
    expect(await jwt.verifyToken(token)).toBeNull();
  });
});

describe("refreshToken", () => {
  it("re-mints a valid token preserving the absolute deadline", async () => {
    const aexp = jwt.freshAbsoluteDeadline();
    const token = await jwt.signToken(aexp);
    const refreshed = await jwt.refreshToken(token);
    expect(refreshed).toBeTruthy();
    const claims = await jwt.verifyToken(refreshed!);
    expect(claims?.aexp).toBe(aexp); // absolute cap unchanged across refresh
  });

  it("returns null for an invalid token", async () => {
    expect(await jwt.refreshToken("nope")).toBeNull();
  });
});
