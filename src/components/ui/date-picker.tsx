"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { parseISODate, toISODate } from "@/lib/date";

interface DatePickerProps {
  id?: string;
  /** Selected date as yyyy-MM-dd. */
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  /** yyyy-MM-dd bounds — dates outside this range aren't selectable. */
  min?: string;
  max?: string;
}

/** Single-date field: a button trigger showing the formatted date, backed by
 * a shadcn Calendar popover instead of the native `<input type="date">`. */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  min,
  max,
  ...props
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value);
  const minDate = parseISODate(min);
  const maxDate = parseISODate(max);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground",
          )}
          {...props}
        >
          <CalendarIcon className="size-4" aria-hidden />
          {selected ? format(selected, "d MMM yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(toISODate(date));
            setOpen(false);
          }}
          disabled={
            minDate || maxDate
              ? (date) => Boolean((minDate && date < minDate) || (maxDate && date > maxDate))
              : undefined
          }
        />
      </PopoverContent>
    </Popover>
  );
}
