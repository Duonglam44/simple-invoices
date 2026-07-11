import { describe, expect, it } from "vitest";
import { loginSchema } from "@/validation/login";

describe("loginSchema", () => {
  it("trims whitespace around the username", () => {
    const result = loginSchema.safeParse({
      username: "  94756921275  ",
      password: "secret",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.username).toBe("94756921275");
  });

  it("rejects an empty username", () => {
    const result = loginSchema.safeParse({ username: "", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-numeric username", () => {
    const result = loginSchema.safeParse({ username: "user@x.com", password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ username: "94756921275", password: "" });
    expect(result.success).toBe(false);
  });
});
