import "server-only";

import { getServerEnv } from "@/lib/env";
import { toUpstreamError, UpstreamApiError } from "@/api/errors";

export interface TokenResponse {
  accessToken: string;
}

export interface UserProfile {
  fullName: string;
  orgToken: string;
  orgName: string;
}

/**
 * OAuth2 password-grant token exchange. Runs exclusively on the server:
 * this is the only place client_id / client_secret are ever used.
 */
export async function fetchAccessToken(
  username: string,
  password: string,
): Promise<TokenResponse> {
  const env = getServerEnv();

  const response = await fetch(`${env.authBaseUrl}${env.authTokenPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.clientId,
      client_secret: env.clientSecret,
      grant_type: "password",
      scope: "openid",
      username,
      password,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw await toUpstreamError(response);

  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) {
    throw new UpstreamApiError(502, "Identity server returned no access token");
  }
  return { accessToken: body.access_token };
}

interface ProfileResponse {
  data?: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    memberships?: Array<{ token?: string; organisationName?: string }>;
  };
}

/**
 * Fetches the user profile and extracts the organisation token
 * (memberships[0].token) required by the invoice-service.
 */
export async function fetchUserProfile(accessToken: string): Promise<UserProfile> {
  const env = getServerEnv();

  const response = await fetch(
    `${env.apiBaseUrl}/membership-service/1.0.0/users/me`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );

  if (!response.ok) throw await toUpstreamError(response);

  const body = (await response.json()) as ProfileResponse;
  const membership = body.data?.memberships?.[0];
  if (!membership?.token) {
    throw new UpstreamApiError(502, "User profile has no organisation membership token");
  }

  const fullName =
    body.data?.fullName ??
    [body.data?.firstName, body.data?.lastName].filter(Boolean).join(" ") ??
    "User";

  return {
    fullName,
    orgToken: membership.token,
    orgName: membership.organisationName ?? "",
  };
}
