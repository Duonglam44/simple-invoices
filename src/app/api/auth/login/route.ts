import { NextResponse } from "next/server";
import { fetchAccessToken, fetchUserProfile } from "@/api/auth";
import { UpstreamApiError } from "@/api/errors";
import { createSession } from "@/lib/session";
import { loginSchema } from "@/validation/login";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/log";
import { LOGIN_ATTEMPT_LIMIT, LOGIN_ATTEMPT_WINDOW_MS } from "@/constants/rate-limit";

// Per-IP throttle against credential stuffing / brute force. Deliberately
// keyed by IP rather than by username — a per-account lockout would let an
// attacker lock a victim out just by failing their login repeatedly.

/**
 * POST /api/auth/login
 *
 * Server-side token exchange (BFF). The browser only ever submits the user's
 * own username/password here; client_id / client_secret live exclusively on
 * the server, and the resulting tokens are stored in httpOnly cookies —
 * they never reach client-side JavaScript.
 */
export async function POST(request: Request) {
  if (!rateLimit(`login:${clientIp(request)}`, LOGIN_ATTEMPT_LIMIT, LOGIN_ATTEMPT_WINDOW_MS)) {
    return NextResponse.json(
      { message: "Too many sign-in attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const { accessToken } = await fetchAccessToken(
      parsed.data.username,
      parsed.data.password,
    );
    const profile = await fetchUserProfile(accessToken);

    await createSession(accessToken, profile.orgToken, {
      name: profile.fullName,
      orgName: profile.orgName,
    });

    return NextResponse.json({
      user: { name: profile.fullName, orgName: profile.orgName },
    });
  } catch (error) {
    if (error instanceof UpstreamApiError) {
      // Wrong credentials come back from the identity server as 400/401.
      if (error.status === 400 || error.status === 401) {
        return NextResponse.json(
          { message: "Invalid username or password" },
          { status: 401 },
        );
      }
      logError("login.upstream_error", { status: error.status, message: error.message });
      return NextResponse.json(
        { message: "Sign-in is temporarily unavailable. Please try again." },
        { status: 502 },
      );
    }
    throw error;
  }
}
