// Password hashing for the single admin credential.
// scrypt is in Node's standard library — no extra dependency.
// Stored format (in ADMIN_PASSWORD_HASH): "salt:hash", both hex.
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const KEYLEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | undefined
): Promise<boolean> {
  if (!stored) return false;
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(password, salt, KEYLEN)) as Buffer;
  // Length guard before timingSafeEqual (it throws on length mismatch).
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}
