import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/constants/session";

/**
 * Route protection at the edge. Unauthenticated visitors are sent to /login;
 * authenticated visitors landing on /login are sent back to the invoice list.
 *
 * This only checks cookie *presence* for fast redirects — every API route and
 * server component still resolves the session itself, so a forged cookie
 * gains nothing (the upstream services reject it with 401).
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);

  if (pathname === "/login") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect all pages; API routes enforce auth themselves and return JSON 401s.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
