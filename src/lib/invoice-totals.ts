import { EXTENSION_TYPES } from "@/constants/invoice";

export const EXTENSION_TYPE_LABELS: Record<
  (typeof EXTENSION_TYPES)[number],
  string
> = {
  PERCENTAGE: "%",
  FIXED_VALUE: "flat",
};

/** "10%" for a percentage adjustment, "10 (flat)" for a fixed-value one. */
export function formatAdjustment(
  value: number,
  type: (typeof EXTENSION_TYPES)[number],
): string {
  return type === "PERCENTAGE" ? `${value}%` : `${value} (flat)`;
}

interface LineItemAmounts {
  quantity: number;
  rate: number;
  taxType: (typeof EXTENSION_TYPES)[number];
  taxValue: number;
  discountType: (typeof EXTENSION_TYPES)[number];
  discountValue: number;
}

export function computeTotals({
  quantity,
  rate,
  taxType,
  taxValue,
  discountType,
  discountValue,
}: LineItemAmounts) {
  const subtotal = quantity * rate;
  const taxAmount =
    taxType === "PERCENTAGE" ? subtotal * (taxValue / 100) : taxValue;
  const discountAmount =
    discountType === "PERCENTAGE"
      ? subtotal * (discountValue / 100)
      : discountValue;
  return {
    subtotal,
    taxAmount,
    discountAmount,
    total: subtotal + taxAmount - discountAmount,
  };
}
