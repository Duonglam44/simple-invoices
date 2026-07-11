"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseISODate, toISODate } from "@/lib/date";

interface DateRangePickerProps {
  from?: string;
  to?: string;
  onApply: (from: string, to: string) => void;
  onClear: () => void;
}

export function DateRangePicker({ from, to, onApply, onClear }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const urlKey = `${from ?? ""}|${to ?? ""}`;
  const [prevUrlKey, setPrevUrlKey] = useState(urlKey);
  const [draftFrom, setDraftFrom] = useState(from ?? "");
  const [draftTo, setDraftTo] = useState(to ?? "");
  const [month, setMonth] = useState<Date>(parseISODate(from) ?? new Date());
  if (urlKey !== prevUrlKey) {
    setPrevUrlKey(urlKey);
    setDraftFrom(from ?? "");
    setDraftTo(to ?? "");
  }

  const draftRange: DateRange | undefined = draftFrom
    ? { from: parseISODate(draftFrom), to: parseISODate(draftTo) }
    : undefined;
  const draftValid = Boolean(draftFrom && draftTo && draftFrom <= draftTo);

  const hasValue = Boolean(from || to);
  const fromDate = parseISODate(from);
  const toDate = parseISODate(to);
  const label =
    fromDate && toDate
      ? `${format(fromDate, "d MMM yyyy")} – ${format(toDate, "d MMM yyyy")}`
      : "Invoice date";

  function commit(fromValue: string, toValue: string) {
    onApply(fromValue, toValue);
    setOpen(false);
  }

  function handleCalendarSelect(next: DateRange | undefined) {
    setDraftFrom(next?.from ? toISODate(next.from) : "");
    setDraftTo(next?.to ? toISODate(next.to) : "");
    if (next?.from && next?.to && next.from.getTime() !== next.to.getTime()) {
      commit(toISODate(next.from), toISODate(next.to));
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("justify-start font-normal", !hasValue && "text-muted-foreground")}
        >
          <CalendarIcon className="size-4" aria-hidden />
          {label}
          {hasValue && (
            <span
              role="button"
              aria-label="Clear date range"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onClear();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  onClear();
                }
              }}
              className="hover:bg-muted -mr-1 ml-1 rounded-sm p-0.5"
            >
              <X className="size-3.5" aria-hidden />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-1rem)] p-3" align="start">
        {/* Manual entry */}
        <div className="flex items-end gap-2">
          <div className="grid min-w-0 flex-1 gap-1">
            <Label htmlFor="range-from" className="text-muted-foreground text-xs">
              From
            </Label>
            <Input
              id="range-from"
              type="date"
              value={draftFrom}
              max={draftTo || undefined}
              onChange={(event) => {
                setDraftFrom(event.target.value);
                const parsed = parseISODate(event.target.value);
                if (parsed) setMonth(parsed);
              }}
              className="h-8 text-sm [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
          <span className="text-muted-foreground pb-2">–</span>
          <div className="grid min-w-0 flex-1 gap-1">
            <Label htmlFor="range-to" className="text-muted-foreground text-xs">
              To
            </Label>
            <Input
              id="range-to"
              type="date"
              value={draftTo}
              min={draftFrom || undefined}
              onChange={(event) => setDraftTo(event.target.value)}
              className="h-8 text-sm [&::-webkit-calendar-picker-indicator]:hidden"
            />
          </div>
        </div>

        <Calendar
          mode="range"
          selected={draftRange}
          onSelect={handleCalendarSelect}
          month={month}
          onMonthChange={setMonth}
          numberOfMonths={1}
          showOutsideDays={false}
          className="mt-2 w-full p-0"
          classNames={{ root: "w-full" }}
        />

        <div className="mt-2 flex justify-end gap-2 border-t pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraftFrom("");
              setDraftTo("");
              if (hasValue) onClear();
              setOpen(false);
            }}
          >
            Clear
          </Button>
          <Button
            size="sm"
            disabled={!draftValid}
            onClick={() => commit(draftFrom, draftTo)}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
