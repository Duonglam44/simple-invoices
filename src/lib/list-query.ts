import type { InvoiceListQuery } from "@/lib/types";
import {
  CLIENT_SORT_FIELDS,
  ISO_DATE_PATTERN,
  PAGE_SIZES,
  SORT_FIELDS,
  STATUS_FILTERS,
} from "@/constants/invoice";

export { SORT_FIELDS, CLIENT_SORT_FIELDS, STATUS_FILTERS, PAGE_SIZES };

/**
 * Parses and sanitises invoice-list query parameters from an untrusted
 * source (URL). Unknown values fall back to safe defaults, so nothing
 * unvalidated is ever forwarded to the upstream service.
 */
export function parseListQuery(params: URLSearchParams): InvoiceListQuery {
  const pageNum = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const rawSize = Number.parseInt(params.get("size") ?? "10", 10);
  const pageSize = (PAGE_SIZES as readonly number[]).includes(rawSize) ? rawSize : 10;

  const rawSort = params.get("sortBy") ?? "CREATED_DATE";
  const sortBy = (SORT_FIELDS as readonly string[]).includes(rawSort)
    ? rawSort
    : "CREATED_DATE";

  const ordering = params.get("ordering") === "ASCENDING" ? "ASCENDING" : "DESCENDING";

  const rawStatus = params.get("status") ?? "";
  const status = (STATUS_FILTERS as readonly string[]).includes(rawStatus)
    ? rawStatus
    : undefined;

  const keyword = params.get("keyword")?.trim().slice(0, 100) || undefined;

  const fromDate = params.get("fromDate") ?? "";
  const toDate = params.get("toDate") ?? "";

  return {
    pageNum,
    pageSize,
    sortBy,
    ordering,
    keyword,
    status,
    fromDate: ISO_DATE_PATTERN.test(fromDate) ? fromDate : undefined,
    toDate: ISO_DATE_PATTERN.test(toDate) ? toDate : undefined,
  };
}

export function appendInvoiceFilterParams(
  params: URLSearchParams,
  query: Pick<InvoiceListQuery, "keyword" | "status" | "fromDate" | "toDate">,
): void {
  if (query.keyword) params.set("keyword", query.keyword);
  if (query.status) params.set("status", query.status);
  if (query.fromDate) params.set("fromDate", query.fromDate);
  if (query.toDate) params.set("toDate", query.toDate);
}
