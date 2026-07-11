"use client";

import { useSearchParams } from "next/navigation";

/**
 * Detail-dialog selection persisted in the URL (`?invoice=<id>`), so a
 * reload — or a shared link — reopens the same invoice. Uses the native
 * History API (Next.js shallow routing): the URL and `useSearchParams`
 * update without a server round-trip, and Back closes the dialog.
 */
export function useInvoiceParam() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("invoice");

  function select(invoiceId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set("invoice", invoiceId);
    window.history.pushState(null, "", url);
  }

  function clear() {
    const url = new URL(window.location.href);
    url.searchParams.delete("invoice");
    window.history.pushState(null, "", url);
  }

  return { selectedId, select, clear };
}
