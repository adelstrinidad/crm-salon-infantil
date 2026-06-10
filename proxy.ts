import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  ABSOLUTE_MAX_AGE_SECONDS,
  verifyToken,
  refreshToken,
} from "@/lib/auth/jwt";

const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token && (await verifyToken(token))) {
    const res = NextResponse.next();
    // Slide the idle window forward on activity: re-mint the token (same
    // absolute deadline, fresh idle `exp`) so an active user stays logged in
    // while an idle one is logged out after the idle window elapses.
    const refreshed = await refreshToken(token);
    if (refreshed) {
      res.cookies.set(COOKIE_NAME, refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ABSOLUTE_MAX_AGE_SECONDS,
      });
    }
    return res;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

// `api` is excluded on purpose: the only API route (the .ics calendar feed)
// authenticates with its own unguessable token, not the session cookie. ANY
// new route under app/api/** must implement its own auth — it is NOT gated
// here. Static assets are excluded so they serve without a session.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
