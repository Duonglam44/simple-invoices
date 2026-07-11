import { NextRequest, NextResponse } from "next/server";
import { listInvoices } from "@/api/invoices";
import { getSession, getSessionUser } from "@/lib/session";
import { parseListQuery } from "@/lib/list-query";
import { toCsv } from "@/lib/csv";
import { invoiceCsvRow } from "@/lib/invoice-csv";
import { INVOICE_CSV_HEADERS } from "@/constants/invoice";
import { rateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit-log";
import { handleUpstreamError, isCrossSiteRequest, unauthorized } from "@/api/http";
import {
  EXPORT_MAX_RECORDS,
  EXPORT_PAGE_SIZE,
  EXPORT_RATE_LIMIT,
  EXPORT_RATE_WINDOW_MS,
} from "@/constants/rate-limit";

/**
 * GET /api/invoices/export — streams a CSV of every invoice matching the
 * current filters (keyword/status/date range/sort), walking every page of
 * the upstream list. Runs server-side so tokens never reach the browser.
 *
 * `excludeIds` (comma-separated invoiceIds) supports the "select all matching
 * filters, then untick a few" flow: the header checkbox doesn't fetch every
 * row up front, so those exclusions are only known client-side and forwarded
 * here to be dropped from the export.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  if (isCrossSiteRequest(request)) {
    return NextResponse.json({ message: "Cross-site request rejected" }, { status: 403 });
  }

  if (!rateLimit(`export:${session.accessToken}`, EXPORT_RATE_LIMIT, EXPORT_RATE_WINDOW_MS)) {
    return NextResponse.json(
      { message: "Too many export requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  // Same whitelist parsing as the list — page/size are overridden below.
  const query = parseListQuery(request.nextUrl.searchParams);
  const excludeIds = new Set(
    (request.nextUrl.searchParams.get("excludeIds") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );

  try {
    const rows: unknown[][] = [];
    let pageNum = 1;
    let totalRecords = Infinity;

    while (rows.length < Math.min(totalRecords, EXPORT_MAX_RECORDS)) {
      const result = await listInvoices(session, {
        ...query,
        pageNum,
        pageSize: EXPORT_PAGE_SIZE,
      });
      totalRecords = result.paging.totalRecords;
      if (result.data.length === 0) break;
      for (const invoice of result.data) {
        if (excludeIds.has(invoice.invoiceId)) continue;
        rows.push(invoiceCsvRow(invoice));
      }
      pageNum += 1;
    }

    const truncated = totalRecords > EXPORT_MAX_RECORDS;
    const filename = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;

    const user = await getSessionUser();
    auditLog("invoice.export", {
      user: user?.name,
      org: user?.orgName,
      recordCount: rows.length,
      excludedCount: excludeIds.size,
      truncated,
    });

    return new NextResponse(toCsv(INVOICE_CSV_HEADERS, rows.slice(0, EXPORT_MAX_RECORDS)), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        // PII + financial data: explicitly opt out of any HTTP caching
        // rather than relying on heuristic caching rules for this download.
        "Cache-Control": "no-store",
        // Surfaced so the client could warn about capped exports if desired.
        "X-Total-Records": String(totalRecords),
        "X-Truncated": String(truncated),
      },
    });
  } catch (error) {
    return handleUpstreamError(error, "invoice.export_upstream_error", "Export failed");
  }
}
