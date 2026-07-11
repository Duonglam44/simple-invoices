import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Baseline security headers. The CSP allows 'unsafe-eval' only in
 * development (required by React Fast Refresh); 'unsafe-inline' for styles is
 * required by Tailwind's inlined style tags.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  // Drop the "X-Powered-By: Next.js" header — no reason to hand attackers a
  // free framework/version fingerprint.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Ignored by browsers over plain HTTP, so safe to always send —
          // enforces HTTPS on every subsequent visit once one response with
          // this header has been received over TLS.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Isolates our browsing context from cross-origin openers/openees
          // and stops other origins from embedding our responses.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        // BFF responses carry invoice PII and session-scoped data; route
        // handlers here don't get an automatic Cache-Control from Next.js,
        // and a 200 without one is eligible for heuristic HTTP caching.
        source: "/api/(.*)",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
