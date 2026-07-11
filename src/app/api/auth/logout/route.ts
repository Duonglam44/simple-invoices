import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";
import { isCrossSiteRequest } from "@/api/http";

// Both handlers reject cross-site requests: logout's Set-Cookie deletions
// apply even on a request that carried no session cookie, so without this
// check any third-party page could force-log a user out via a top-level
// navigation (GET) or form submission (POST) — SameSite=Lax does not stop
// either. Legitimate callers are always same-origin (the app's own fetch
// and internal redirects).

/** POST /api/auth/logout — clears the session cookies. */
export async function POST(request: Request) {
  if (isCrossSiteRequest(request)) {
    return NextResponse.json({ message: "Cross-site request rejected" }, { status: 403 });
  }
  await destroySession();
  return new NextResponse(null, { status: 204 });
}

/**
 * GET /api/auth/logout — used as a redirect target when a server component
 * detects an expired upstream session (server components cannot mutate
 * cookies themselves). Clears the session and lands on the login screen.
 */
export async function GET(request: Request) {
  if (isCrossSiteRequest(request)) {
    return NextResponse.json({ message: "Cross-site request rejected" }, { status: 403 });
  }
  await destroySession();
  return NextResponse.redirect(new URL("/login", request.url));
}
