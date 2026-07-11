import { toCsv } from "@/lib/csv";
import { customerName, primaryStatus } from "@/lib/format";
import { INVOICE_CSV_HEADERS } from "@/constants/invoice";
import type { InvoiceListItem } from "@/lib/types";

/**
 * Invoice → CSV mapping, shared by the server-side full export route and the
 * client-side selected-rows export.
 */

export { INVOICE_CSV_HEADERS };

export function invoiceCsvRow(invoice: InvoiceListItem): unknown[] {
  return [
    invoice.invoiceNumber,
    invoice.referenceNo ?? "",
    customerName(invoice.customer),
    invoice.description ?? "",
    invoice.invoiceDate,
    invoice.dueDate,
    invoice.createdAt,
    invoice.currency,
    invoice.invoiceSubTotal,
    invoice.totalDiscount,
    invoice.totalTax,
    invoice.totalAmount,
    invoice.totalPaid,
    invoice.balanceAmount,
    primaryStatus(invoice.status),
  ];
}

export function invoicesToCsv(invoices: InvoiceListItem[]): string {
  return toCsv(INVOICE_CSV_HEADERS, invoices.map(invoiceCsvRow));
}
