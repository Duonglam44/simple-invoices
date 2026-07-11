"use client";

import { useMemo } from "react";
import { useListNavigation } from "@/hooks/use-list-navigation";
import { PAGE_SIZES } from "@/lib/list-query";
import type { Paging } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Pagination({ paging }: { paging: Paging }) {
  const { apply } = useListNavigation();
  function navigate(changes: Record<string, string>) {
    apply(changes, { resetPage: !("page" in changes && changes.page) });
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(paging.totalRecords / paging.pageSize)), [paging.totalRecords, paging.pageSize]);
  const current = useMemo(() => Math.min(paging.pageNumber, totalPages), [paging.pageNumber, totalPages]);
  const from = useMemo(() => (paging.totalRecords === 0 ? 0 : (current - 1) * paging.pageSize + 1), [current, paging.pageSize, paging.totalRecords]);
  const to = useMemo(() => Math.min(current * paging.pageSize, paging.totalRecords), [current, paging.pageSize, paging.totalRecords]);

  return (
    <div className="bg-card flex flex-col gap-1 md:gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        Showing{" "}
        <span className="text-foreground font-medium">
          {from}–{to}
        </span>{" "}
        of <span className="text-foreground font-medium">{paging.totalRecords}</span>
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
        <label className="text-muted-foreground flex items-center gap-1.5">
          <span className="hidden md:inline">Per page</span>
          <Select
            value={String(paging.pageSize)}
            onValueChange={(value) => navigate({ size: value, page: "" })}
          >
            <SelectTrigger size="sm" aria-label="Invoices per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={current <= 1}
            onClick={() => navigate({ page: String(current - 1) })}
          >
            ← <span className="hidden md:inline">Prev</span>
          </Button>
          <span className="text-muted-foreground px-2">
            Page <span className="text-foreground font-medium">{current}</span> /{" "}
            {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= totalPages}
            onClick={() => navigate({ page: String(current + 1) })}
          >
            <span className="hidden md:inline">Next</span> →
          </Button>
        </div>
      </div>
    </div>
  );
}
