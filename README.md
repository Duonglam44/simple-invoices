# SimpleInvoice

A simple invoicing web application built for the **101 Digital Web Engineer Assessment (v2.2.4)**.

Sign in with a 101 Digital sandbox account, browse/search/filter/sort/paginate invoices, and create new invoices — with all credentials and tokens handled strictly on the server.

## Features

- **Authentication** — login form with client- and server-side validation; OAuth2 password-grant token exchange performed exclusively on the server; per-IP rate limiting against brute force.
- **Invoice list (default landing screen)** — search by invoice number (debounced, applies 350ms after the last keystroke or immediately on Enter), filter by status (Paid / Due / Overdue) and date range, sort by created/invoice/due date and total/due amount in both directions, and paginate (10/20/50 per page). Click any row for a detail dialog fetched by id — the selection is kept in the URL (`?invoice=<id>`) so it survives reloads and can be shared.
- **CSV export** — export every invoice matching the current filters (with "select all, untick a few" support), streamed server-side page by page; cells are sanitised against CSV formula injection.
- **Printable invoice page** (`/invoices/[id]`) — a full, print-ready invoice document (letterhead, billed-to, line items, totals) rendered server-side; the app chrome is hidden when printing.
- **Create invoice** — as a modal from the list or a full page (`/invoices/new`): a sectioned single-line-item form (invoice details, line item, customer, bank/remittance details, billing address — the latter two pre-filled with the sandbox defaults but fully editable), full validation, live amount preview, a read-only review step, and a success toast; the list refreshes automatically via TanStack Query cache invalidation.
- **Fully responsive** — table view on desktop, card view on mobile.

## Tech stack & dependencies

Requires **Node.js ≥ 20** (developed on v20.15).

| Concern | Library | Version |
|---|---|---|
| Framework | Next.js (App Router, SSR) + TypeScript | 16.2.10 / TS 5.9 |
| UI runtime | React + React DOM | 19.2.4 |
| UI components | shadcn/ui (Radix primitives via `radix-ui`) | radix-ui 1.6 |
| Styling | Tailwind CSS | 4.3 |
| Server state / data fetching | TanStack Query (server prefetch + client hydration) | 5.101 |
| Client state | Zustand (session user info, invoice UI state) | 5.0 |
| Forms | react-hook-form + @hookform/resolvers | 7.81 |
| Validation | zod (schemas shared between client & server) | 4.4 |
| Dates | date-fns + react-day-picker (calendar) | 4.4 / 10.0 |
| Toasts | sonner (via shadcn/ui) | 2.0 |
| Icons | lucide-react | 1.24 |
| Testing | Vitest + React Testing Library + jsdom | 3.2 / 16.3 |
| Linting | ESLint 9 + eslint-config-next | 9.39 |

Small utilities: `clsx`, `tailwind-merge`, `class-variance-authority` (shadcn/ui styling helpers), `tw-animate-css`, `next-themes`, and `server-only` (build-time guard that server modules never reach the client bundle). A `postcss ^8.5.16` override in `package.json` pins a transitive dependency past a security advisory.

Exact resolved versions live in `package-lock.json` (`npm ci` reproduces them).

## Getting started

```bash
# 1. Install dependencies (Node.js >= 20)
npm ci                       # or: npm install

# 2. Configure environment
cp .env.example .env.local
#    …then fill in the real sandbox values (AUTH_BASE_URL, AUTH_TOKEN_PATH,
#    API_BASE_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET)

# 3. Run
npm run dev                  # development — http://localhost:3000
# or a production build:
npm run build && npm start   # http://localhost:3000 (use `npm start -- -p 3001` for another port)

# 4. Test / lint
npm test                     # run the unit-test suite once
npm run test:watch           # watch mode
npm run lint
```

Sign in with the sandbox user from the assessment document (§6.1 — credentials are deliberately not committed to this repository).

## Architecture

The app follows a **Backend-for-Frontend (BFF)** pattern: the browser only ever talks to the Next.js server; the Next.js server is the only party that talks to 101 Digital.

```
Browser                        Next.js server                    101 Digital
───────                        ──────────────                    ───────────
Login form ──POST /api/auth/login──▶ Route handler
                                      ├─▶ POST /oauth2/token ──────▶ identity server
                                      ├─▶ GET /users/me ───────────▶ membership-service
                                      │     (org_token = memberships[0].token)
                                      └─ set httpOnly cookies
                                         (si_access_token, si_org_token)

Invoice list (RSC) ◀──HTML────── Server component
    URL params                        └─▶ GET /invoices?… ─────────▶ invoice-service
    (search/sort/filter/page)             Authorization + org-token

Create form ──POST /api/invoices──▶ Route handler
                                      ├─ zod re-validation (server-side)
                                      └─▶ POST /invoices ──────────▶ invoice-service
```

Key points:

- **`src/proxy.ts`** guards all pages at the edge: no session cookie → redirect to `/login`; already signed in → `/login` redirects home. It only checks cookie *presence* for speed — real authorization always happens upstream, so a forged cookie gains nothing.
- **The invoice list is server-side rendered with TanStack Query hydration.** The server component prefetches the upstream invoice-service query into a TanStack Query cache and dehydrates it into the HTML, so the first paint ships fully rendered with data (no loading spinner). On the client, the same query key hydrates the cache; subsequent search/filter/page changes update the URL and refetch through `/api/invoices` client-side (with `keepPreviousData` for smooth transitions) — no full page reloads. All list state (keyword, status, dates, sort, page, size) lives in the URL, so results are shareable/bookmarkable and the back button works. Untrusted URL params are sanitised by a whitelist parser (`src/lib/list-query.ts`) on both ends.
- **Zustand holds cross-cutting client state**: the signed-in user's display info (seeded from the server session by `UserStoreHydrator` — never tokens) and the invoice list/detail UI state. Server caches, loading and error states belong to TanStack Query; Zustand is deliberately kept to pure UI/client state.
- **`POST /api/invoices` re-validates on the server** with the *same* zod schema used by the client form (`src/validation/invoice.ts`), so the two can never drift, then maps the form values to the invoice-service payload (`src/lib/invoice-payload.ts`).

## Security posture

Mapped to the assessment's recommendations:

| Recommendation | Implementation |
|---|---|
| Server-side token exchange | `POST /oauth2/token` is called only from `src/api/auth.ts` (server-only module) via the `/api/auth/login` route handler. The browser never sees `client_id`/`client_secret`. |
| Secrets out of the browser bundle | No `NEXT_PUBLIC_*` variables. All config is read via `src/lib/env.ts`, which imports the `server-only` package — importing it from client code fails the build. |
| Secure token storage | `access_token` and `org_token` are stored in `httpOnly`, `SameSite=Lax` cookies (plus `Secure` in production), set by the server. Nothing token-related is in `localStorage`/`sessionStorage`. Cookie lifetime is derived from the JWT `exp` claim, so cookies can't outlive the tokens. |
| BFF / proxy pattern | Every membership-service / invoice-service call happens on the server (route handlers + server components). The client only calls `/api/*` on the same origin, and API responses carry `Cache-Control: no-store`. |
| Secrets hygiene | Real values live in git-ignored `.env.local`; `.env.example` (committed) documents the shape with placeholders. |
| Validation & headers | zod validation runs on the server for login and invoice creation, and list/export query params are whitelist-parsed (client-side validation is UX only). Security headers — CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP — are set in `next.config.ts`. |

Beyond the brief: per-IP login rate limiting, per-session export rate limiting, cross-site request rejection (`Sec-Fetch-Site`) on logout and CSV export, CSV formula-injection escaping, structured audit logging for invoice create/export, and `X-Powered-By` disabled.

## Project structure

```
src/
├── app/
│   ├── (app)/                     # authenticated shell (header, nav, user menu)
│   │   ├── page.tsx               # invoice list — default landing screen
│   │   └── invoices/
│   │       ├── new/page.tsx       # full-page create-invoice form
│   │       └── [id]/page.tsx      # printable invoice document (SSR)
│   ├── login/page.tsx
│   ├── layout.tsx                 # root layout (fonts, providers, toaster)
│   └── api/                       # BFF endpoints (the only thing the browser calls)
│       ├── auth/login/route.ts    # token exchange + profile + cookie session
│       ├── auth/logout/route.ts   # session teardown (cross-site requests rejected)
│       └── invoices/
│           ├── route.ts           # GET list / POST create (server-validated)
│           ├── [id]/route.ts      # GET single invoice (id format validated)
│           └── export/route.ts    # GET CSV export (rate-limited, audited)
├── api/                           # upstream API clients — all `server-only`
│   ├── auth.ts                    # oauth2/token + users/me
│   ├── invoices.ts                # invoice-service list/get/create
│   ├── errors.ts                  # normalised UpstreamApiError
│   └── http.ts                    # shared route-handler helpers (401, 502, CSRF check)
├── client/invoices.ts             # browser-side helpers calling our BFF endpoints
├── components/
│   ├── ui/                        # shadcn/ui primitives (button, table, dialog, …)
│   ├── custom/                    # reusable form fields (text, select, date, …)
│   ├── invoices/                  # list view, filters, table, pagination, detail,
│   │   └── CreateInvoice/         #   create form + fields + preview
│   ├── login/                     # login form
│   ├── nav/                       # header nav links + user menu
│   ├── providers.tsx              # TanStack QueryClientProvider + Toaster
│   └── UserStoreHydrator.tsx      # server session → Zustand (display info only)
├── constants/                     # invoice enums, cookie names, rate-limit tuning
├── hooks/                         # URL-state hooks (list navigation, ?invoice= param)
├── lib/                           # framework-free logic
│   ├── session.ts                 # httpOnly cookie session (create/get/destroy)
│   ├── env.ts                     # server-only env access
│   ├── list-query.ts              # URL-param whitelist parser
│   ├── invoice-payload.ts         # form → invoice-service payload mapper
│   ├── invoice-totals.ts          # tax/discount/total math
│   ├── csv.ts, invoice-csv.ts     # CSV writer (formula-injection safe) + row mapper
│   ├── rate-limit.ts              # fixed-window in-memory limiter
│   ├── jwt.ts                     # JWT exp decoding (drives cookie lifetimes)
│   ├── audit-log.ts, log.ts       # structured JSON logging
│   └── date.ts, format.ts, sort.ts, query-client.ts, types.ts, utils.ts
├── stores/                        # Zustand stores (user info, invoice UI state)
├── validation/                    # zod schemas shared by client & server
├── __tests__/                     # Vitest unit tests (mirrors src layout)
└── proxy.ts                       # edge route protection
```

## Testing

**106 unit tests across 13 files** (Vitest + React Testing Library) cover the key functionality:

- invoice & login zod schemas (happy paths, coercion, every rejection rule),
- the URL-parameter sanitiser (defaults, whitelisting, malformed input),
- the form → API payload mapper (single line item, optional-field omission),
- invoice total/tax/discount math,
- CSV serialisation incl. formula-injection escaping,
- JWT expiry decoding (drives cookie lifetimes),
- display formatters and client-side sorting,
- component tests with a mocked router/fetch: the login form (validation, submission, server-error display), the list filters (debounced search timing, Enter-to-submit, trimming), the create-invoice form (field rendering incl. bank/billing address, required-field and country-code validation, no re-render while typing, preview → review → submit flow), and the create-invoice dialog (URL reset after success).

```bash
npm test
```

The full flow (login → list/search/filter → create → search the new invoice → export → logout, plus auth guards and security headers) was also verified end-to-end against the live sandbox.

## Design decisions & assumptions

- **One line item per invoice** — as specified; the mapper enforces it structurally.
- **Bank account & billing address** — the create form exposes editable "Bank / remittance details" and "Billing address" sections, pre-filled with the sandbox values from Appendix A (`DEFAULT_BANK_ACCOUNT` / `DEFAULT_BILLING_ADDRESS` in `src/constants/invoice.ts`) so a reviewer can submit without retyping them, while still allowing real values to be entered.
- **Status filter values** — the invoice-service was probed and `Paid`, `Due`, `Overdue` are exposed; `sortBy` supports `CREATED_DATE`, `INVOICE_DATE`, `DUE_DATE`, `TOTAL_AMOUNT`, `DUE_AMOUNT`.
- **Session lifetime = token lifetime** — the sandbox issues ~1-hour tokens and revokes the previous token when a new one is issued for the same user, so no refresh-token rotation is implemented; when the session expires the user is returned to the login screen cleanly (a 401 from upstream clears the cookies).
- **Invoice numbers** — pre-filled with a unique `INV<timestamp>` (mirroring the sandbox convention) but user-editable.