"use client";

import { useState, useCallback, useRef } from "react";
import { ArrowDownUp, Download, ListFilter, Loader2, Search, X } from "lucide-react";
import { toast } from "sonner";
import { CLIENT_SORT_FIELDS, parseListQuery, SORT_FIELDS, STATUS_FILTERS } from "@/lib/list-query";
import { useListNavigation } from "@/hooks/use-list-navigation";
import { selectedCount, useInvoiceUiStore } from "@/stores/invoice-ui-store";
import { invoicesToCsv } from "@/lib/invoice-csv";
import { exportInvoicesCsv } from "@/client/invoices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DateRangePicker } from "@/components/invoices/DateRangePicker";

const SORT_LABELS: Record<string, string> = {
  CREATED_DATE: "Created date",
  INVOICE_DATE: "Invoice date",
  DUE_DATE: "Due date",
  TOTAL_AMOUNT: "Total",
  DUE_AMOUNT: "Balance",
  DISCOUNT: "Discount (this page)",
};

const ALL_SORT_FIELDS = [...SORT_FIELDS, ...CLIENT_SORT_FIELDS];

const ALL_STATUSES = "__all__";

/** Pause after the last keystroke before the search is applied automatically. */
const SEARCH_DEBOUNCE_MS = 350;
interface InvoiceFiltersProps {
  totalRecords: number;
  isFetching?: boolean;
}

export function InvoiceFilters({ totalRecords, isFetching = false }: InvoiceFiltersProps) {
  const { searchParams, apply, reset } = useListNavigation();
  const selectionMode = useInvoiceUiStore((state) => state.selectionMode);
  const selected = useInvoiceUiStore((state) => state.selected);
  const [isExporting, setIsExporting] = useState(false);
  const count = selectedCount(selectionMode, selected, totalRecords);

  const exportSelected = useCallback(async () => {
    setIsExporting(true);
    try {
      let blob: Blob;
      if (selectionMode === "exclude") {
        const query = parseListQuery(new URLSearchParams(searchParams.toString()));
        blob = await exportInvoicesCsv(query, Object.keys(selected));
      } else {
        const csv = invoicesToCsv(Object.values(selected));
        blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export invoices. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [selectionMode, selected, searchParams]);

  const urlKeyword = searchParams.get("keyword") ?? "";
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [keyword, setKeyword] = useState(urlKeyword);
  const [selfApplied, setSelfApplied] = useState<string | null>(null);
  const [prevUrlKeyword, setPrevUrlKeyword] = useState(urlKeyword);

  if (urlKeyword !== prevUrlKeyword) {
    setPrevUrlKeyword(urlKeyword);
    if (urlKeyword !== selfApplied) setKeyword(urlKeyword);
    setSelfApplied(null);
  }

  const cancelPendingSearch = useCallback(() => {
    if (searchTimerRef.current !== null) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  }, []);

  const applyKeyword = useCallback((value: string) => {
    const trimmed = value.trim();
    setSelfApplied(trimmed);
    apply({ keyword: trimmed });
  }, [apply]);

  const debounceSearch = useCallback((value: string) => {
    cancelPendingSearch();
    searchTimerRef.current = setTimeout(() => {
      searchTimerRef.current = null;
      applyKeyword(value);
    }, SEARCH_DEBOUNCE_MS);
  }, [applyKeyword, cancelPendingSearch]);

  const status = searchParams.get("status") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "CREATED_DATE";
  const ordering = searchParams.get("ordering") ?? "DESCENDING";
  const fromDate = searchParams.get("fromDate") ?? "";
  const toDate = searchParams.get("toDate") ?? "";
  const hasActiveFilters =
    Boolean(keyword || status || fromDate || toDate) ||
    sortBy !== "CREATED_DATE" ||
    ordering !== "DESCENDING";

  return (
    <div className="bg-card rounded-xl border p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-2.5">
        {/* Row 1 — search */}
        <form
          className="flex min-w-0 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            cancelPendingSearch();
            applyKeyword(keyword);
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden
            />
            <Input
              type="search"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                debounceSearch(event.target.value);
              }}
              placeholder="Search by invoice number…"
              aria-label="Search invoices"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0" disabled={isFetching}>
            {isFetching && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Search
          </Button>
        </form>

        {/* Row 2 — filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={status || ALL_STATUSES}
            onValueChange={(value) =>
              apply({ status: value === ALL_STATUSES ? "" : value })
            }
          >
            <SelectTrigger size="sm" aria-label="Filter by status" className="gap-1.5">
              <ListFilter className="text-muted-foreground size-4" aria-hidden />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {STATUS_FILTERS.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker
            from={fromDate || undefined}
            to={toDate || undefined}
            onApply={(from, to) => apply({ fromDate: from, toDate: to })}
            onClear={() => apply({ fromDate: "", toDate: "" })}
          />

          <Select value={sortBy} onValueChange={(value) => apply({ sortBy: value })}>
            <SelectTrigger size="sm" aria-label="Sort by" className="md:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_SORT_FIELDS.map((value) => (
                <SelectItem key={value} value={value}>
                  {SORT_LABELS[value] ?? value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() =>
              apply({ ordering: ordering === "DESCENDING" ? "ASCENDING" : "DESCENDING" })
            }
            title={`Currently ${ordering.toLowerCase()} — click to toggle`}
          >
            <ArrowDownUp className="size-4" aria-hidden />
            {ordering === "DESCENDING" ? "Desc" : "Asc"}
          </Button>

          {hasActiveFilters && (
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              <X className="size-4" aria-hidden />
              Clear
            </Button>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-auto hidden md:inline-flex">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isExporting || count === 0}
                  onClick={exportSelected}
                >
                  {isExporting ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Download className="size-4" aria-hidden />
                  )}
                  Export CSV{count > 0 && ` (${count})`}
                </Button>
              </span>
            </TooltipTrigger>
            {(isExporting || count === 0) && (
              <TooltipContent>
                {isExporting
                  ? "Exporting your invoices…"
                  : "Select invoices in the table first"}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
