// Pure JWT session logic — jose only, NO next/headers import, so it is safe to
// use from both the edge proxy (proxy.ts) and Node server code (session.ts).
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const COOKIE_NAME = "session";

// Two-window session model (no server-side store needed):
//   - IDLE window  → the JWT `exp`. Each authenticated request re-mints the
//     token (proxy), so this is a true inactivity timeout: no traffic for this
//     long ⇒ the token expires and the user must log in again.
//   - ABSOLUTE cap → the `aexp` claim, fixed at login. Even with constant
//     activity the session can't outlive this, bounding a stolen token.
export const IDLE_MAX_AGE_SECONDS = 30 * 60; // 30 min of inactivity
export const ABSOLUTE_MAX_AGE_SECONDS = 12 * 60 * 60; // 12 h hard cap

export type SessionClaims = JWTPayload & { authenticated?: boolean; aexp?: number };

// Fail fast: an unset/empty AUTH_SECRET would otherwise become an empty HMAC
// key, making every JWT forgeable. Validate once at module load instead of a
// `!` non-null assertion that silently passes `undefined` through.
function getSecret(): Uint8Array {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error(
      "AUTH_SECRET must be set and at least 32 chars. Generate with: openssl rand -base64 32",
    );
  }
  return new TextEncoder().encode(value);
}

const secret = getSecret();

// Mint a token whose idle `exp` is IDLE_MAX_AGE_SECONDS from now and whose
// absolute deadline is `aexp` (carried across refreshes).
export async function signToken(aexp: number): Promise<string> {
  return new SignJWT({ authenticated: true, aexp })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + IDLE_MAX_AGE_SECONDS)
    .sign(secret);
}

export function freshAbsoluteDeadline(): number {
  return Math.floor(Date.now() / 1000) + ABSOLUTE_MAX_AGE_SECONDS;
}

// Verify a raw token: valid HS256 signature, not past idle `exp` (jose
// enforces), `authenticated` claim true, and not past the absolute cap.
export async function verifyToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify<SessionClaims>(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.authenticated !== true) return null;
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.aexp !== "number" || now >= payload.aexp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Slide the idle window forward on activity, preserving the absolute deadline.
// Returns a new token, or null if the session is no longer valid.
export async function refreshToken(token: string): Promise<string | null> {
  const claims = await verifyToken(token);
  if (!claims || typeof claims.aexp !== "number") return null;
  return signToken(claims.aexp);
}
