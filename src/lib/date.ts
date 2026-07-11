import { format } from "date-fns";

/** Parses yyyy-MM-dd as a *local* date (avoids the UTC shift of new Date(s)). */
export function parseISODate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
