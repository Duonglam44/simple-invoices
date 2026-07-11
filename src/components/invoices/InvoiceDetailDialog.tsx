"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useInvoiceParam } from "@/hooks/use-invoice-param";
import { fetchInvoice } from "@/client/invoices";
import { customerName, formatDate, formatMoney, primaryStatus } from "@/lib/format";
import type { InvoiceDetail, InvoiceListItem } from "@/lib/types";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function DateBlock({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-muted/40 rounded-lg px-3 py-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{formatDate(value)}</p>
    </div>
  );
}

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <dt className="text-muted-foreground shrink-0 text-sm">{label}</dt>
      <dd
        className={`min-w-0 truncate text-right text-sm ${
          muted ? "text-muted-foreground" : "font-medium"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
      {children}
    </h3>
  );
}

export function InvoiceDetailDialog({ invoices }: { invoices?: InvoiceListItem[] }) {
  const { selectedId, clear } = useInvoiceParam();

  const fromList = invoices?.find((item) => item.invoiceId === selectedId);
  const { data: fetched, isPending: isFetching } = useQuery({
    queryKey: ["invoice", selectedId],
    queryFn: () => fetchInvoice(selectedId!),
    enabled: Boolean(selectedId && !fromList),
  });

  const invoice: InvoiceDetail | InvoiceListItem | null =
    fromList ?? fetched ?? null;
  const status = invoice ? primaryStatus(invoice.status) : "";
  const outstanding = (invoice?.balanceAmount ?? 0) > 0;
  const customFields =
    invoice?.customFields?.filter((field) => field.key !== "createdBy") ?? [];

  return (
    <Dialog open={selectedId !== null} onOpenChange={(open) => !open && clear()}>
      <DialogContent
        mobileSheet
        className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-md"
      >
        {invoice ? (
          <>
            <div className="border-b p-6 py-4">
              <DialogHeader className="gap-1.5">
                <div className="flex items-start justify-between gap-3 pr-8">
                  <DialogTitle className="text-lg leading-tight break-all line-clamp-2">
                    {invoice.invoiceNumber}
                  </DialogTitle>
                  <StatusBadge status={status} />
                </div>
                <DialogDescription>
                  {customerName(invoice.customer)}
                  {invoice.referenceNo && ` · Ref: ${invoice.referenceNo}`}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="bg-muted/50 flex items-end justify-between gap-4 border-b px-6 py-4">
                <div>
                  <p className="text-muted-foreground text-xs">Total amount</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {formatMoney(invoice.totalAmount, invoice.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Balance due</p>
                  <p
                    className={`mt-1 text-base font-semibold ${
                      outstanding && status === "Overdue" ? "text-destructive" : ""
                    }`}
                  >
                    {formatMoney(invoice.balanceAmount, invoice.currency)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 px-6 py-4">
                <DateBlock label="Issued" value={invoice.invoiceDate} />
                <DateBlock label="Due" value={invoice.dueDate} />
                <DateBlock label="Created" value={invoice.createdAt} />
              </div>

              <div className="space-y-1 border-t px-6 py-4">
                <SectionTitle>Amounts</SectionTitle>
                <dl>
                  <Row
                    label="Subtotal"
                    value={formatMoney(invoice.invoiceSubTotal, invoice.currency)}
                  />
                  <Row
                    label="Discount"
                    value={formatMoney(invoice.totalDiscount, invoice.currency)}
                    muted={!invoice.totalDiscount}
                  />
                  <Row
                    label="Tax"
                    value={formatMoney(invoice.totalTax, invoice.currency)}
                    muted={!invoice.totalTax}
                  />
                  <Row
                    label="Gross total"
                    value={formatMoney(invoice.invoiceGrossTotal, invoice.currency)}
                  />
                  <Row
                    label="Paid"
                    value={formatMoney(invoice.totalPaid, invoice.currency)}
                    muted={!invoice.totalPaid}
                  />
                </dl>
              </div>

              <div className="space-y-1 border-t px-6 py-4">
                <SectionTitle>Parties</SectionTitle>
                <dl>
                  <Row label="Customer" value={customerName(invoice.customer)} />
                  {invoice.customer?.contact?.email && (
                    <Row label="Email" value={invoice.customer.contact.email} />
                  )}
                  {invoice.customer?.contact?.mobileNumber && (
                    <Row label="Mobile" value={invoice.customer.contact.mobileNumber} />
                  )}
                  <Row label="Merchant" value={invoice.merchant?.name ?? "—"} />
                </dl>
              </div>

              {invoice.description && (
                <div className="space-y-1.5 border-t px-6 py-4">
                  <SectionTitle>Description</SectionTitle>
                  <p className="text-sm leading-relaxed">{invoice.description}</p>
                </div>
              )}

              {customFields.length > 0 && (
                <div className="space-y-1 border-t px-6 py-4">
                  <SectionTitle>Custom fields</SectionTitle>
                  <dl>
                    {customFields.map((field) => (
                      <Row key={field.key} label={field.key} value={field.value} />
                    ))}
                  </dl>
                </div>
              )}

              <div className="space-y-1 border-t px-6 py-4">
                <SectionTitle>Record</SectionTitle>
                <dl>
                  <Row label="Currency" value={invoice.currency} />
                  <Row label="Type" value={invoice.type ?? "—"} muted />
                  <Row
                    label="Documents"
                    value={invoice.numberOfDocuments ?? 0}
                    muted={!invoice.numberOfDocuments}
                  />
                  <Row
                    label="Payments"
                    value={invoice.payments?.length ?? 0}
                    muted={!invoice.payments?.length}
                  />
                  <Row
                    label="Invoice ID"
                    value={
                      <span className="font-mono text-xs">{invoice.invoiceId}</span>
                    }
                    muted
                  />
                </dl>
              </div>
            </div>

            <div className="bg-background flex justify-end gap-2 rounded-b-lg border-t px-6 py-4 max-sm:rounded-b-none">
              <Button variant="outline" onClick={clear}>
                Close
              </Button>
              <Button asChild>
                <Link target="_blank" href={`/invoices/${invoice.invoiceId}`}>View detail</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground px-6 py-16 text-center text-sm">
            <DialogHeader className="sr-only">
              <DialogTitle>Invoice detail</DialogTitle>
              <DialogDescription>Loading invoice…</DialogDescription>
            </DialogHeader>
            {isFetching ? "Loading invoice…" : "Invoice not found."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
