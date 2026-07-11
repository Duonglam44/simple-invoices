"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import type { InvoiceListItem } from "@/lib/types";
import { customerName, formatDate, formatMoney, primaryStatus } from "@/lib/format";
import {
  headerSelectionState,
  isRowSelected,
  useInvoiceUiStore,
} from "@/stores/invoice-ui-store";
import { useInvoiceParam } from "@/hooks/use-invoice-param";
import { Checkbox } from "@/components/ui/checkbox";
import { useListNavigation } from "@/hooks/use-list-navigation";
import { nextSort, sortStateFromParams } from "@/lib/sort";
import { StatusBadge } from "@/components/invoices/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Column header wired to the URL sort state: clicking a new column sorts it
 * descending, clicking the active column flips the direction. Only columns
 * the invoice-service can actually sort by (`sortBy` enum) get this control.
 */
function SortableHead({
  field,
  children,
  className,
}: {
  field: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { searchParams, apply } = useListNavigation();
  const sort = sortStateFromParams(new URLSearchParams(searchParams.toString()));
  const active = sort.sortBy === field;

  return (
    <TableHead
      aria-sort={
        active ? (sort.ordering === "ASCENDING" ? "ascending" : "descending") : "none"
      }
      className={className}
    >
      <button
        type="button"
        onClick={() => apply({ ...nextSort(sort, field) })}
        className={cn(
          "hover:text-foreground -mx-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 transition-colors",
          active && "text-foreground font-semibold",
        )}
      >
        {children}
        {active ? (
          sort.ordering === "ASCENDING" ? (
            <ArrowUp className="size-3.5" aria-hidden />
          ) : (
            <ArrowDown className="size-3.5" aria-hidden />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-40" aria-hidden />
        )}
      </button>
    </TableHead>
  );
}

/**
 * Responsive invoice list: a table on ≥md screens, stacked cards on mobile.
 * Row selection (for the detail dialog) lives in the URL (`?invoice=<id>`).
 */
interface InvoiceTableProps {
  invoices: InvoiceListItem[];
  /** Total records matching the current filters (across all pages). */
  totalRecords: number;
}

export function InvoiceTable({ invoices, totalRecords }: InvoiceTableProps) {
  const { select } = useInvoiceParam();
  const selectionMode = useInvoiceUiStore((state) => state.selectionMode);
  const selected = useInvoiceUiStore((state) => state.selected);
  const toggleSelected = useInvoiceUiStore((state) => state.toggleSelected);
  const selectAllMatching = useInvoiceUiStore((state) => state.selectAllMatching);
  const clearSelected = useInvoiceUiStore((state) => state.clearSelected);

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-4 py-12 text-center">
        <p className="text-sm font-medium">No invoices found</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try adjusting the filters, or create your first invoice.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card hidden overflow-x-auto rounded-xl border shadow-sm md:block">
        <Table className="min-w-[850px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[4%]">
                <Checkbox
                  aria-label="Select all invoices matching the current filters"
                  title="Select all records (every page)"
                  disabled={totalRecords === 0}
                  checked={headerSelectionState(selectionMode, selected, totalRecords)}
                  onCheckedChange={(checked) =>
                    checked === true ? selectAllMatching() : clearSelected()
                  }
                />
              </TableHead>
              <TableHead className="w-[14%]">Invoice #</TableHead>
              <TableHead className="w-[12%]">Customer</TableHead>
              <TableHead className="w-[14%]">Description</TableHead>
              <SortableHead field="INVOICE_DATE" className="w-[9%]">
                Issued
              </SortableHead>
              <SortableHead field="DUE_DATE" className="w-[9%]">
                Due
              </SortableHead>
              {/* DISCOUNT is not in the upstream sortBy enum — sorted client-side */}
              <SortableHead field="DISCOUNT" className="w-[9%] text-right">
                Discount
              </SortableHead>
              <SortableHead field="TOTAL_AMOUNT" className="w-[10%] text-right">
                Total
              </SortableHead>
              <SortableHead field="DUE_AMOUNT" className="w-[11%] text-right">
                Balance
              </SortableHead>
              <TableHead className="w-[8%]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.invoiceId}
                onClick={() => select(invoice.invoiceId)}
                className="cursor-pointer"
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    aria-label={`Select invoice ${invoice.invoiceNumber}`}
                    checked={isRowSelected(selectionMode, selected, invoice.invoiceId)}
                    onCheckedChange={() => toggleSelected(invoice)}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <p className="text-primary truncate font-medium">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-muted-foreground truncate text-xs font-normal">
                          Ref: {invoice.referenceNo ?? "-"}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {invoice.invoiceNumber}
                      {invoice.referenceNo && ` · Ref: ${invoice.referenceNo}`}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="truncate">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{customerName(invoice.customer)}</span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {customerName(invoice.customer)}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="whitespace-normal">
                  {invoice.description ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
                          {invoice.description}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs whitespace-pre-wrap">
                        {invoice.description}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground truncate">
                  {formatDate(invoice.invoiceDate)}
                </TableCell>
                <TableCell className="text-muted-foreground truncate">
                  {formatDate(invoice.dueDate)}
                </TableCell>
                <TableCell
                  className={cn(
                    "truncate text-right",
                    !invoice.totalDiscount && "text-muted-foreground",
                  )}
                >
                  {formatMoney(invoice.totalDiscount, invoice.currency)}
                </TableCell>
                <TableCell className="truncate text-right font-medium">
                  {formatMoney(invoice.totalAmount, invoice.currency)}
                </TableCell>
                <TableCell className="text-muted-foreground truncate text-right">
                  {formatMoney(invoice.balanceAmount, invoice.currency)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={primaryStatus(invoice.status)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden p-[1px] md:p-0">
        {invoices.map((invoice) => (
          <li key={invoice.invoiceId}>
            <Card
              role="button"
              tabIndex={0}
              onClick={() => select(invoice.invoiceId)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  select(invoice.invoiceId);
                }
              }}
              className="cursor-pointer py-4 transition active:bg-muted"
            >
              <CardContent className="px-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-primary font-medium">
                    {invoice.invoiceNumber}
                  </span>
                  <StatusBadge status={primaryStatus(invoice.status)} />
                </div>
                <p className="mt-1 text-sm">{customerName(invoice.customer)}</p>
                <div className="mt-2 flex items-end justify-between text-sm">
                  <span className="text-muted-foreground">
                    Due {formatDate(invoice.dueDate)}
                  </span>
                  <span className="font-semibold">
                    {formatMoney(invoice.totalAmount, invoice.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
