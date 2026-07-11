/** Normalised error for all upstream (101 Digital) API failures. */
export class UpstreamApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "UpstreamApiError";
    this.status = status;
    this.code = code;
  }
}

interface UpstreamErrorBody {
  errors?: Array<{ code?: string; message?: string }>;
  error_description?: string;
  error?: string;
  message?: string;
}

/**
 * Extract a human-readable message from the various error shapes the
 * identity server ({error, error_description}) and the API gateway
 * ({errors: [{code, message}]}) return.
 */
export async function toUpstreamError(response: Response): Promise<UpstreamApiError> {
  let body: UpstreamErrorBody | null = null;
  try {
    body = (await response.json()) as UpstreamErrorBody;
  } catch {
    // Non-JSON error body — fall through to the status text.
  }

  const first = body?.errors?.[0];
  const message =
    first?.message ??
    body?.error_description ??
    body?.message ??
    body?.error ??
    `Upstream request failed with status ${response.status}`;

  return new UpstreamApiError(response.status, message, first?.code);
}
