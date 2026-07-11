import { NextResponse } from "next/server";
import { UpstreamApiError } from "@/api/errors";
import { logError } from "@/lib/log";

/** Standard 401 JSON body — shared so every BFF route returns the identical shape. */
export function unauthorized(): NextResponse {
  return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
}

/**
 * SameSite=Lax still attaches the session cookie on cross-site *top-level*
 * navigations, and a response's Set-Cookie headers apply even when the
 * request carried no cookie — so routes whose side effects can be triggered
 * by simple navigation (GET download, logout) reject cross-site requests
 * outright. Browsers without Fetch Metadata headers pass through: this is
 * defense in depth on top of SameSite, not the primary control.
 */
export function isCrossSiteRequest(request: Request): boolean {
  return request.headers.get("sec-fetch-site") === "cross-site";
}

/**
 * Common tail of a BFF route's catch block: an `UpstreamApiError` with
 * status 401 means the upstream session died mid-request, so it's treated
 * the same as never having had one; anything else is logged and surfaced as
 * a 502. Route-specific status codes (e.g. 404 "not found") should be
 * checked by the caller *before* falling back to this helper. Non-upstream
 * errors are rethrown so Next.js's own error handling takes over.
 */
export function handleUpstreamError(
  error: unknown,
  event: string,
  fallbackMessage: string,
): NextResponse {
  if (!(error instanceof UpstreamApiError)) throw error;
  if (error.status === 401) return unauthorized();
  logError(event, { status: error.status, message: error.message });
  return NextResponse.json({ message: error.message || fallbackMessage }, { status: 502 });
}
