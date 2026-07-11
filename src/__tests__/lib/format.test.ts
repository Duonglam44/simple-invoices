import { describe, expect, it } from "vitest";
import {
  currencySymbol,
  customerName,
  formatDate,
  formatMoney,
  primaryStatus,
} from "@/lib/format";

describe("formatMoney", () => {
  it("formats known currencies with their symbol", () => {
    expect(formatMoney(1234.5, "GBP")).toBe("£1,234.50");
  });

  it("returns a dash for missing amounts", () => {
    expect(formatMoney(undefined, "GBP")).toBe("—");
  });
});

describe("currencySymbol", () => {
  it("returns the narrow symbol for known currencies", () => {
    expect(currencySymbol("GBP")).toBe("£");
    expect(currencySymbol("USD")).toBe("$");
    expect(currencySymbol("EUR")).toBe("€");
  });

  it("falls back to the currency code itself when unknown", () => {
    expect(currencySymbol("NOTACODE")).toBe("NOTACODE");
  });
});

describe("formatDate", () => {
  it("formats ISO dates for display", () => {
    expect(formatDate("2026-07-10")).toBe("10 Jul 2026");
  });

  it("returns a dash for missing dates", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("passes through unparseable values instead of crashing", () => {
    expect(formatDate("garbage")).toBe("garbage");
  });
});

describe("customerName", () => {
  it("prefers the combined name on older records", () => {
    expect(customerName({ name: "James Corp" })).toBe("James Corp");
  });

  it("joins first/last name on newer records", () => {
    expect(customerName({ firstName: "Nguyen", lastName: "Dung 2" })).toBe(
      "Nguyen Dung 2",
    );
    expect(customerName({ firstName: "Solo" })).toBe("Solo");
  });

  it("prefers the combined name when both shapes are present", () => {
    expect(customerName({ name: "Combined", firstName: "First" })).toBe("Combined");
  });

  it("falls back to a dash when nothing is available", () => {
    expect(customerName(undefined)).toBe("—");
    expect(customerName({})).toBe("—");
    expect(customerName({ name: "  " })).toBe("—");
  });
});

describe("primaryStatus", () => {
  it("returns the first active status key", () => {
    expect(
      primaryStatus([
        { key: "Paid", value: false },
        { key: "Overdue", value: true },
      ]),
    ).toBe("Overdue");
  });

  it("falls back to Unknown when nothing is active", () => {
    expect(primaryStatus([])).toBe("Unknown");
    expect(primaryStatus(undefined)).toBe("Unknown");
  });
});
