import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  return (browserQueryClient ??= makeQueryClient());
}

/** Single source of truth for invoice query keys (server prefetch + client). */
export function invoicesQueryKey(query: unknown) {
  return ["invoices", query] as const;
}
