// In-memory fixed-window rate limiter for the login endpoint. Brute-force
// defense for the single-admin credential: without it, an attacker can try
// passwords as fast as the server answers.
//
// Scope/limitation: state lives in this process's memory, so it resets on
// redeploy and is per-instance (not shared across a horizontally-scaled
// deployment). For this single-instance app that is sufficient; a multi-node
// deployment should move this to a shared store (e.g. Redis).

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 15 * 60 * 1000; // 15 min
const MAX_ATTEMPTS = 5; // failed attempts per key per window

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

// Check (and on failure, consume) the limit for a key. Call `check` before
// verifying the password; on a FAILED login call `recordFailure`, and on a
// SUCCESSFUL login call `reset` so a legitimate user isn't punished.
export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordFailure(key: string, now = Date.now()): void {
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

export function reset(key: string): void {
  buckets.delete(key);
}

// Test-only: clear all buckets between cases.
export function __resetAll(): void {
  buckets.clear();
}

export const RATE_LIMIT = { WINDOW_MS, MAX_ATTEMPTS };
