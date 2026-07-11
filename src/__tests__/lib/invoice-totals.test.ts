import { describe, expect, it } from "vitest";
import { computeTotals, formatAdjustment } from "@/lib/invoice-totals";

describe("computeTotals", () => {
  it("computes a plain subtotal with no tax or discount", () => {
    const result = computeTotals({
      quantity: 2,
      rate: 150,
      taxType: "PERCENTAGE",
      taxValue: 0,
      discountType: "PERCENTAGE",
      discountValue: 0,
    });
    expect(result).toEqual({ subtotal: 300, taxAmount: 0, discountAmount: 0, total: 300 });
  });

  it("applies a percentage tax and a fixed-value discount", () => {
    const result = computeTotals({
      quantity: 1,
      rate: 100,
      taxType: "PERCENTAGE",
      taxValue: 10,
      discountType: "FIXED_VALUE",
      discountValue: 15,
    });
    expect(result).toEqual({ subtotal: 100, taxAmount: 10, discountAmount: 15, total: 95 });
  });

  it("applies a fixed-value tax and a percentage discount", () => {
    const result = computeTotals({
      quantity: 1,
      rate: 200,
      taxType: "FIXED_VALUE",
      taxValue: 20,
      discountType: "PERCENTAGE",
      discountValue: 50,
    });
    expect(result).toEqual({ subtotal: 200, taxAmount: 20, discountAmount: 100, total: 120 });
  });
});

describe("formatAdjustment", () => {
  it("formats a percentage adjustment", () => {
    expect(formatAdjustment(10, "PERCENTAGE")).toBe("10%");
  });

  it("formats a fixed-value adjustment", () => {
    expect(formatAdjustment(25, "FIXED_VALUE")).toBe("25 (flat)");
  });
});
