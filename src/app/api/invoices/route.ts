import { NextRequest, NextResponse } from "next/server";
import { createInvoice, listInvoices } from "@/api/invoices";
import { getSession, getSessionUser } from "@/lib/session";
import { buildInvoicePayload } from "@/lib/invoice-payload";
import { invoiceFormSchema } from "@/validation/invoice";
import { parseListQuery } from "@/lib/list-query";
import { auditLog } from "@/lib/audit-log";
import { handleUpstreamError, unauthorized } from "@/api/http";

/**
 * GET /api/invoices — BFF proxy for the invoice list.
 * Only whitelisted query parameters are forwarded upstream.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const query = parseListQuery(request.nextUrl.searchParams);
    const result = await listInvoices(session, query);
    return NextResponse.json(result);
  } catch (error) {
    return handleUpstreamError(error, "invoice.upstream_error", "Invoice service request failed");
  }
}

/**
 * POST /api/invoices — validates the submission server-side (never trusting
 * client-side validation alone) and forwards it to the invoice-service.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = invoiceFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await createInvoice(session, buildInvoicePayload(parsed.data));
    const user = await getSessionUser();
    auditLog("invoice.create", {
      user: user?.name,
      org: user?.orgName,
      invoiceNumber: parsed.data.invoiceNumber,
    });
    return NextResponse.json(
      { message: "Invoice created successfully", result },
      { status: 201 },
    );
  } catch (error) {
    return handleUpstreamError(error, "invoice.upstream_error", "Invoice service request failed");
  }
}
