import "server-only";

import { getServerEnv } from "@/lib/env";
import { toUpstreamError } from "@/api/errors";
import { appendInvoiceFilterParams } from "@/lib/list-query";
import type { Session } from "@/lib/session";
import type {
  CreateInvoicePayload,
  InvoiceDetailResponse,
  InvoiceListQuery,
  InvoiceListResponse,
} from "@/lib/types";

function authHeaders(session: Session): Record<string, string> {
  return {
    Authorization: `Bearer ${session.accessToken}`,
    "org-token": session.orgToken,
  };
}

export async function listInvoices(
  session: Session,
  query: InvoiceListQuery,
): Promise<InvoiceListResponse> {
  const env = getServerEnv();

  const params = new URLSearchParams({
    pageNum: String(query.pageNum),
    pageSize: String(query.pageSize),
    sortBy: query.sortBy,
    ordering: query.ordering,
  });
  appendInvoiceFilterParams(params, query);

  const response = await fetch(
    `${env.apiBaseUrl}/invoice-service/1.0.0/invoices?${params}`,
    { headers: authHeaders(session), cache: "no-store" },
  );

  if (!response.ok) throw await toUpstreamError(response);
  return (await response.json()) as InvoiceListResponse;
}

export async function getInvoice(
  session: Session,
  invoiceId: string,
): Promise<InvoiceDetailResponse> {
  const env = getServerEnv();

  const response = await fetch(
    `${env.apiBaseUrl}/invoice-service/1.0.0/invoices/${encodeURIComponent(invoiceId)}`,
    { headers: authHeaders(session), cache: "no-store" },
  );

  if (!response.ok) throw await toUpstreamError(response);
  return (await response.json()) as InvoiceDetailResponse;
}

export async function createInvoice(
  session: Session,
  payload: CreateInvoicePayload,
): Promise<unknown> {
  const env = getServerEnv();

  const response = await fetch(`${env.apiBaseUrl}/invoice-service/1.0.0/invoices`, {
    method: "POST",
    headers: {
      ...authHeaders(session),
      "Operation-Mode": "SYNC",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) throw await toUpstreamError(response);
  return response.json();
}
