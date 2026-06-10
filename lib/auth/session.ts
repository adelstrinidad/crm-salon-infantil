import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  ABSOLUTE_MAX_AGE_SECONDS,
  signToken,
  verifyToken,
  freshAbsoluteDeadline,
} from "./jwt";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function createSession() {
  const token = await signToken(freshAbsoluteDeadline());
  const cookieStore = await cookies();
  // The cookie lives as long as the absolute cap; the JWT `exp` (idle window)
  // is what actually expires the session, so the browser can still send a
  // now-expired cookie that we reject server-side.
  cookieStore.set(COOKIE_NAME, token, cookieOptions(ABSOLUTE_MAX_AGE_SECONDS));
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<{ authenticated: boolean } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const claims = await verifyToken(token);
  return claims ? { authenticated: true } : null;
}

// Guard for Server Actions: the proxy gates page navigation, but a Server
// Action POST must also verify the session (defense in depth). Redirects to
// /login when unauthenticated.
export async function requireSession(): Promise<{ authenticated: boolean }> {
  const session = await getSession();
  if (!session?.authenticated) {
    redirect("/login");
  }
  return session;
}
