"use client";

import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { parseListQuery } from "@/lib/list-query";
import { sortStateFromParams } from "@/lib/sort";
import { fetchInvoices } from "@/client/invoices";
import { invoicesQueryKey } from "@/lib/query-client";
import { useInvoiceUiStore } from "@/stores/invoice-ui-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { InvoiceTableSkeleton } from "@/components/invoices/InvoiceTableSkeleton";
import { InvoiceDetailDialog } from "@/components/invoices/InvoiceDetailDialog";
import { Pagination } from "@/components/invoices/Pagination";

export function InvoiceListView() {
  const searchParams = useSearchParams();
  const openCreate = useInvoiceUiStore((state) => state.openCreate);
  const query = parseListQuery(new URLSearchParams(searchParams.toString()));

  const { data, error, isFetching, isPending, refetch } = useQuery({
    queryKey: invoicesQueryKey(query),
    queryFn: () => fetchInvoices(query),
    placeholderData: keepPreviousData,
  });

  // True while re-fetching after a search / sort / filter / page change —
  // the previous page stays visible (keepPreviousData) but dimmed.
  const isRefreshing = isFetching && !isPending;

  const rawSort = sortStateFromParams(new URLSearchParams(searchParams.toString()));
  let rows = data?.data;
  if (rows && rawSort.sortBy === "DISCOUNT") {
    const direction = rawSort.ordering === "ASCENDING" ? 1 : -1;
    rows = [...rows].sort(
      (a, b) => ((a.totalDiscount ?? 0) - (b.totalDiscount ?? 0)) * direction,
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 md:h-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Invoices</h1>
          {data && (
            <p className="text-muted-foreground mt-0.5 text-sm">
              {data.paging.totalRecords} invoice
              {data.paging.totalRecords === 1 ? "" : "s"} in total
            </p>
          )}
        </div>
        <Button onClick={openCreate}>+ New invoice</Button>
      </div>

      <InvoiceFilters
        totalRecords={data?.paging.totalRecords ?? 0}
        isFetching={isRefreshing}
      />

      {error ? (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-4 py-6 text-center text-sm"
        >
          <p>{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => refetch()}
          >
            Try again
          </Button>
        </div>
      ) : isPending ? (
        <InvoiceTableSkeleton />
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col md:flex-none">
          <div
            aria-busy={isRefreshing}
            className={cn(
              "flex min-h-0 flex-1 flex-col gap-4 transition-opacity md:flex-none",
              isRefreshing && "pointer-events-none opacity-50",
            )}
          >
            {/* Scroll container: vertical for mobile cards, natural on md+ */}
            <div className="min-h-0 flex-1 overflow-y-auto md:flex-none md:overflow-visible">
              <InvoiceTable
                invoices={rows ?? data.data}
                totalRecords={data.paging.totalRecords}
              />
            </div>
            <Pagination paging={data.paging} />
          </div>
          {isRefreshing && (
            <div
              role="status"
              aria-label="Updating invoices"
              className="absolute inset-x-0 top-16 flex justify-center"
            >
              <span className="bg-card text-muted-foreground flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm shadow-sm">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Updating…
              </span>
            </div>
          )}
        </div>
      )}

      <InvoiceDetailDialog invoices={data?.data} />
    </div>
  );
}
