/** Presentation helpers shared by server and client components. */

export function formatMoney(
  amount: number | undefined,
  currency: string,
): string {
  if (amount === undefined || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(amount);
  } catch {
    // Unknown/legacy currency codes fall back to a plain formatted number.
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** e.g. "£" for GBP — falls back to the currency code itself if unknown. */
export function currencySymbol(currency: string): string {
  try {
    const part = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    })
      .formatToParts(0)
      .find((p) => p.type === "currency");
    return part?.value ?? currency;
  } catch {
    return currency;
  }
}

export function formatDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Primary status key of an invoice, e.g. "Paid" / "Overdue" / "Due". */
export function primaryStatus(
  status: Array<{ key: string; value: boolean }> | undefined,
): string {
  return status?.find((s) => s.value)?.key ?? "Unknown";
}

/**
 * Display name for an invoice customer. Older records carry a combined
 * `name`; newer ones only `firstName`/`lastName`.
 */
export function customerName(customer?: {
  name?: string;
  firstName?: string;
  lastName?: string;
}): string {
  if (!customer) return "—";
  const combined = [customer.firstName, customer.lastName]
    .filter(Boolean)
    .join(" ");
  return customer.name?.trim() || combined || "—";
}
