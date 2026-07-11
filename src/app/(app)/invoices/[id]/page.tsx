import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { getInvoice } from "@/api/invoices";
import { UpstreamApiError } from "@/api/errors";
import { customerName, formatDate, formatMoney, primaryStatus } from "@/lib/format";
import type { InvoiceDetail } from "@/lib/types";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import { PrintButton } from "@/components/invoices/PrintButton";
import { Button } from "@/components/ui/button";
import { INVOICE_ID_PATTERN } from "@/constants/invoice";

export const metadata: Metadata = { title: "Invoice" };

function MetaBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {title}
      </h2>
      <div className="mt-2 space-y-0.5 text-sm">{children}</div>
    </div>
  );
}

function TotalsRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-8 py-1.5 ${
        emphasis ? "border-t pt-3 text-base font-bold" : "text-sm"
      }`}
    >
      <span className={emphasis ? "" : "text-muted-foreground"}>{label}</span>
      <span className={emphasis ? "" : "font-medium"}>{value}</span>
    </div>
  );
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  if (!INVOICE_ID_PATTERN.test(id)) notFound();

  let invoice: InvoiceDetail;
  try {
    invoice = (await getInvoice(session, id)).data;
  } catch (error) {
    if (error instanceof UpstreamApiError) {
      if (error.status === 401) redirect("/api/auth/logout");
      if (error.status === 404) notFound();
    }
    throw error;
  }

  const status = primaryStatus(invoice.status);
  const merchantAddress = invoice.merchant?.addresses?.[0];
  const items = invoice.items ?? [];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Back to invoices
          </Link>
        </Button>
        <PrintButton />
      </div>

      <article className="bg-card rounded-xl border p-8 shadow-sm sm:p-10 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-muted-foreground text-sm font-semibold tracking-[0.2em] uppercase">
              Invoice
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight break-all">
              {invoice.invoiceNumber}
            </h1>
            {invoice.referenceNo && (
              <p className="text-muted-foreground mt-1 text-sm">
                Reference: {invoice.referenceNo}
              </p>
            )}
            <div className="mt-3">
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{invoice.merchant?.name ?? "—"}</p>
            {merchantAddress && (
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                {[
                  merchantAddress.premise,
                  merchantAddress.city,
                  merchantAddress.postcode,
                  merchantAddress.countryCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
          </div>
        </header>

        {/* Parties & dates */}
        <div className="mt-8 grid grid-cols-1 gap-6 border-t pt-6 sm:grid-cols-3">
          <MetaBlock title="Billed to">
            <p className="font-medium">{customerName(invoice.customer)}</p>
            {invoice.customer?.contact?.email && (
              <p className="text-muted-foreground">{invoice.customer.contact.email}</p>
            )}
            {invoice.customer?.contact?.mobileNumber && (
              <p className="text-muted-foreground">
                {invoice.customer.contact.mobileNumber}
              </p>
            )}
          </MetaBlock>
          <MetaBlock title="Invoice details">
            <p>
              <span className="text-muted-foreground">Issued: </span>
              <span className="font-medium">{formatDate(invoice.invoiceDate)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Due: </span>
              <span className="font-medium">{formatDate(invoice.dueDate)}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Currency: </span>
              <span className="font-medium">{invoice.currency}</span>
            </p>
          </MetaBlock>
          {(invoice.bankAccount?.accountNumber || invoice.bankAccount?.accountName) && (
            <MetaBlock title="Payment details">
              {invoice.bankAccount.accountName && (
                <p className="font-medium">{invoice.bankAccount.accountName}</p>
              )}
              {invoice.bankAccount.accountNumber && (
                <p className="text-muted-foreground">
                  Account: {invoice.bankAccount.accountNumber}
                </p>
              )}
              {invoice.bankAccount.sortCode && (
                <p className="text-muted-foreground">
                  Sort code: {invoice.bankAccount.sortCode}
                </p>
              )}
            </MetaBlock>
          )}
        </div>

        <div className="mt-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="text-muted-foreground py-2 pr-4 text-xs font-semibold tracking-wide uppercase">
                  Item
                </th>
                <th className="text-muted-foreground py-2 pr-4 text-right text-xs font-semibold tracking-wide uppercase">
                  Qty
                </th>
                <th className="text-muted-foreground py-2 pr-4 text-right text-xs font-semibold tracking-wide uppercase">
                  Rate
                </th>
                <th className="text-muted-foreground py-2 text-right text-xs font-semibold tracking-wide uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.itemReference ?? index} className="border-b">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{item.itemName ?? "—"}</p>
                      {item.description && (
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right">{item.quantity ?? "—"}</td>
                    <td className="py-3 pr-4 text-right">
                      {formatMoney(item.rate, invoice.currency)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatMoney(item.amount ?? item.netAmount, invoice.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b">
                  <td colSpan={4} className="text-muted-foreground py-4 text-center">
                    No line items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs">
            <TotalsRow
              label="Subtotal"
              value={formatMoney(invoice.invoiceSubTotal, invoice.currency)}
            />
            <TotalsRow
              label="Discount"
              value={formatMoney(invoice.totalDiscount, invoice.currency)}
            />
            <TotalsRow
              label="Tax"
              value={formatMoney(invoice.totalTax, invoice.currency)}
            />
            <TotalsRow
              label="Total"
              value={formatMoney(invoice.totalAmount, invoice.currency)}
              emphasis
            />
            <TotalsRow
              label="Paid"
              value={formatMoney(invoice.totalPaid, invoice.currency)}
            />
            <TotalsRow
              label="Balance due"
              value={formatMoney(invoice.balanceAmount, invoice.currency)}
              emphasis
            />
          </div>
        </div>

        {invoice.description && (
          <div className="mt-8 border-t pt-4">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Notes
            </h2>
            <p className="mt-2 text-sm leading-relaxed">{invoice.description}</p>
          </div>
        )}

        <footer className="text-muted-foreground mt-10 border-t pt-4 text-xs">
          <p>
            Invoice ID: <span className="font-mono">{invoice.invoiceId}</span>
          </p>
          <p className="mt-1">Generated by SimpleInvoice.</p>
        </footer>
      </article>
    </div>
  );
}
