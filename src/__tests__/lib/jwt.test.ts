import { describe, expect, it } from "vitest";
import { decodeJwtPayload, secondsUntilExpiry } from "@/lib/jwt";

function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode(payload)}.signature`;
}

describe("decodeJwtPayload", () => {
  it("decodes the payload of a well-formed token", () => {
    const token = makeJwt({ sub: "user-1", exp: 1234567890 });
    expect(decodeJwtPayload(token)).toMatchObject({ sub: "user-1", exp: 1234567890 });
  });

  it("returns null for a malformed token", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
    expect(decodeJwtPayload("a.b")).toBeNull();
    expect(decodeJwtPayload("a.%%%.c")).toBeNull();
  });
});

describe("secondsUntilExpiry", () => {
  it("returns the remaining lifetime for a future expiry", () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) + 600 });
    const remaining = secondsUntilExpiry(token);
    expect(remaining).toBeGreaterThan(590);
    expect(remaining).toBeLessThanOrEqual(600);
  });

  it("returns 0 for an already-expired token", () => {
    const token = makeJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(secondsUntilExpiry(token)).toBe(0);
  });

  it("falls back when the token has no exp claim", () => {
    const token = makeJwt({ sub: "user-1" });
    expect(secondsUntilExpiry(token, 1234)).toBe(1234);
  });

  it("falls back for opaque (non-JWT) tokens", () => {
    expect(secondsUntilExpiry("opaque-token", 900)).toBe(900);
  });
});
