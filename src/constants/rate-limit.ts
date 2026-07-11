/** Per-IP throttle against credential stuffing / brute force on login. */
export const LOGIN_ATTEMPT_LIMIT = 5;
export const LOGIN_ATTEMPT_WINDOW_MS = 60_000;

export const EXPORT_RATE_LIMIT = 10;
export const EXPORT_RATE_WINDOW_MS = 60_000;

/** Safety valve for the shared sandbox — enough for any realistic export. */
export const EXPORT_PAGE_SIZE = 100;
export const EXPORT_MAX_RECORDS = 5000;
