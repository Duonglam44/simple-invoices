import "server-only";

/**
 * Server-side environment configuration.
 *
 * All values are intentionally read from non-NEXT_PUBLIC_ variables so they
 * are never inlined into the client bundle. Importing this module from a
 * client component fails at build time thanks to the `server-only` package.
 */
export interface ServerEnv {
  authBaseUrl: string;
  authTokenPath: string;
  apiBaseUrl: string;
  clientId: string;
  clientSecret: string;
}

export function getServerEnv(): ServerEnv {
  const {
    AUTH_BASE_URL,
    AUTH_TOKEN_PATH,
    API_BASE_URL,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
  } = process.env;

  const missing = Object.entries({
    AUTH_BASE_URL,
    AUTH_TOKEN_PATH,
    API_BASE_URL,
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
  })
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Copy .env.example to .env.local and fill in the values.",
    );
  }

  return {
    authBaseUrl: AUTH_BASE_URL!,
    authTokenPath: AUTH_TOKEN_PATH!,
    apiBaseUrl: API_BASE_URL!,
    clientId: OAUTH_CLIENT_ID!,
    clientSecret: OAUTH_CLIENT_SECRET!,
  };
}
