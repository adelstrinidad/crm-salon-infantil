import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "session";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export async function createSession() {
  const token = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ authenticated: boolean } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return { authenticated: payload.authenticated as boolean };
  } catch {
    return null;
  }
}

// Guard for Server Actions: middleware gates page navigation, but a Server
// Action POST should also verify the session (defense in depth). Redirects to
// /login when unauthenticated.
export async function requireSession(): Promise<{ authenticated: boolean }> {
  const session = await getSession();
  if (!session?.authenticated) {
    redirect("/login");
  }
  return session;
}
