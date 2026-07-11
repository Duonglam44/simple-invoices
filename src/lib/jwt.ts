interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    const payload: unknown = JSON.parse(json);
    if (typeof payload !== "object" || payload === null) return null;
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Seconds until the token expires, or `fallbackSeconds` when the token has
 * no readable `exp` claim. Returns 0 for already-expired tokens.
 */
export function secondsUntilExpiry(token: string, fallbackSeconds = 3600): number {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return fallbackSeconds;
  return Math.max(0, Math.floor(payload.exp - Date.now() / 1000));
}
