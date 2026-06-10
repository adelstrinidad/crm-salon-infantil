import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  recordFailure,
  reset,
  __resetAll,
  RATE_LIMIT,
} from "./rateLimit";

beforeEach(() => __resetAll());

const KEY = "login:1.2.3.4";

describe("checkRateLimit / recordFailure", () => {
  it("allows the first attempt and up to the limit", () => {
    for (let i = 0; i < RATE_LIMIT.MAX_ATTEMPTS; i++) {
      expect(checkRateLimit(KEY).allowed).toBe(true);
      recordFailure(KEY);
    }
    // The (MAX+1)th attempt is now blocked.
    expect(checkRateLimit(KEY).allowed).toBe(false);
  });

  it("reports a positive retry-after when blocked", () => {
    for (let i = 0; i < RATE_LIMIT.MAX_ATTEMPTS; i++) recordFailure(KEY);
    const r = checkRateLimit(KEY);
    expect(r.allowed).toBe(false);
    expect(r.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("isolates keys (one IP being blocked doesn't block another)", () => {
    for (let i = 0; i < RATE_LIMIT.MAX_ATTEMPTS; i++) recordFailure(KEY);
    expect(checkRateLimit(KEY).allowed).toBe(false);
    expect(checkRateLimit("login:9.9.9.9").allowed).toBe(true);
  });

  it("resets the window after it elapses", () => {
    const start = 1_000_000;
    for (let i = 0; i < RATE_LIMIT.MAX_ATTEMPTS; i++) recordFailure(KEY, start);
    expect(checkRateLimit(KEY, start).allowed).toBe(false);
    // Past the window → allowed again.
    expect(checkRateLimit(KEY, start + RATE_LIMIT.WINDOW_MS + 1).allowed).toBe(true);
  });

  it("reset() clears a key's failures (successful login)", () => {
    for (let i = 0; i < RATE_LIMIT.MAX_ATTEMPTS; i++) recordFailure(KEY);
    expect(checkRateLimit(KEY).allowed).toBe(false);
    reset(KEY);
    expect(checkRateLimit(KEY).allowed).toBe(true);
  });
});
