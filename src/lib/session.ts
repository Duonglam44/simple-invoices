import "server-only";

import { cookies } from "next/headers";
import { secondsUntilExpiry } from "@/lib/jwt";
import { ACCESS_TOKEN_COOKIE, ORG_TOKEN_COOKIE, USER_INFO_COOKIE } from "@/constants/session";

export { ACCESS_TOKEN_COOKIE, ORG_TOKEN_COOKIE, USER_INFO_COOKIE };

export interface SessionUser {
  name: string;
  orgName: string;
}

export interface Session {
  accessToken: string;
  orgToken: string;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function createSession(
  accessToken: string,
  orgToken: string,
  user: SessionUser,
): Promise<void> {
  const cookieStore = await cookies();
  // Cookie lifetime follows the shorter of the two token lifetimes so a
  // half-expired session can never be presented to the upstream APIs.
  const maxAge = Math.min(
    secondsUntilExpiry(accessToken),
    secondsUntilExpiry(orgToken),
  );

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions(maxAge));
  cookieStore.set(ORG_TOKEN_COOKIE, orgToken, cookieOptions(maxAge));
  cookieStore.set(USER_INFO_COOKIE, JSON.stringify(user), cookieOptions(maxAge));
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const orgToken = cookieStore.get(ORG_TOKEN_COOKIE)?.value;
  if (!accessToken || !orgToken) return null;
  return { accessToken, orgToken };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(USER_INFO_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(ORG_TOKEN_COOKIE);
  cookieStore.delete(USER_INFO_COOKIE);
}
