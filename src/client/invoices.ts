import type {
  InvoiceDetail,
  InvoiceDetailResponse,
  InvoiceListQuery,
  InvoiceListResponse,
} from "@/lib/types";
import type { InvoiceFormValues } from "@/validation/invoice";
import { appendInvoiceFilterParams } from "@/lib/list-query";

/**
 * Browser-side API helpers. These only ever call our own BFF endpoints —
 * upstream tokens and credentials stay on the server.
 */

function sessionExpired(): never {
  // GET /api/auth/logout clears the cookies and lands on /login.
  window.location.href = "/api/auth/logout";
  throw new Error("Session expired");
}

/** Extracts `{ message }` from a failed BFF response, falling back when the body isn't JSON. */
async function errorMessage(response: Response, fallback: string): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  return body?.message ?? fallback;
}

export async function fetchInvoices(
  query: InvoiceListQuery,
): Promise<InvoiceListResponse> {
  const params = new URLSearchParams({
    page: String(query.pageNum),
    size: String(query.pageSize),
    sortBy: query.sortBy,
    ordering: query.ordering,
  });
  appendInvoiceFilterParams(params, query);

  const response = await fetch(`/api/invoices?${params}`);
  if (response.status === 401) sessionExpired();
  if (!response.ok) throw new Error(await errorMessage(response, "Failed to load invoices"));
  return response.json();
}

export async function exportInvoicesCsv(
  query: Pick<InvoiceListQuery, "sortBy" | "ordering" | "keyword" | "status" | "fromDate" | "toDate">,
  excludeIds: string[],
): Promise<Blob> {
  const params = new URLSearchParams({
    sortBy: query.sortBy,
    ordering: query.ordering,
  });
  appendInvoiceFilterParams(params, query);
  if (excludeIds.length > 0) params.set("excludeIds", excludeIds.join(","));

  const response = await fetch(`/api/invoices/export?${params}`);
  if (response.status === 401) sessionExpired();
  if (!response.ok) throw new Error(await errorMessage(response, "Failed to export invoices"));
  return response.blob();
}

export async function fetchInvoice(invoiceId: string): Promise<InvoiceDetail> {
  const response = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`);
  if (response.status === 401) sessionExpired();
  if (!response.ok) {
    throw new Error(await errorMessage(response, "Failed to load the invoice"));
  }
  const body = (await response.json()) as InvoiceDetailResponse;
  return body.data;
}

export async function createInvoiceRequest(values: InvoiceFormValues): Promise<void> {
  const response = await fetch("/api/invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (response.status === 401) sessionExpired();
  if (!response.ok) {
    throw new Error(await errorMessage(response, "Failed to create the invoice"));
  }
}
