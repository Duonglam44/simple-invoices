import { NextResponse } from "next/server";
import { getInvoice } from "@/api/invoices";
import { UpstreamApiError } from "@/api/errors";
import { getSession } from "@/lib/session";
import { handleUpstreamError, unauthorized } from "@/api/http";
import { INVOICE_ID_PATTERN } from "@/constants/invoice";

/** GET /api/invoices/:id — BFF proxy for a single invoice. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  if (!INVOICE_ID_PATTERN.test(id)) {
    return NextResponse.json({ message: "Invalid invoice id" }, { status: 400 });
  }

  try {
    const result = await getInvoice(session, id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof UpstreamApiError && error.status === 404) {
      return NextResponse.json({ message: "Invoice not found" }, { status: 404 });
    }
    return handleUpstreamError(
      error,
      "invoice.detail_upstream_error",
      "Invoice service request failed",
    );
  }
}
