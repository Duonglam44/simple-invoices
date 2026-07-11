import { describe, expect, it } from "vitest";
import { invoiceFormSchema } from "@/validation/invoice";

const validInput = {
  invoiceNumber: "INV123456701",
  invoiceReference: "#123456",
  currency: "GBP",
  invoiceDate: "2026-07-10",
  dueDate: "2026-07-20",
  description: "Test invoice",
  customer: {
    firstName: "Nguyen",
    lastName: "Dung",
    email: "nguyen@example.com",
    mobileNumber: "+6597594971",
    address: {
      premise: "CT11",
      city: "hanoi",
      county: "hoangmai",
      postcode: "1000",
      countryCode: "VN",
    },
  },
  bankAccount: {
    bankId: "",
    sortCode: "09-01-01",
    accountNumber: "12345678",
    accountName: "John Terry",
  },
  item: {
    itemName: "Consulting",
    description: "July retainer",
    quantity: 2,
    rate: 150,
    itemUOM: "HRS",
    taxType: "PERCENTAGE",
    taxValue: 0,
    discountType: "PERCENTAGE",
    discountValue: 0,
  },
};

describe("invoiceFormSchema", () => {
  it("accepts a fully valid submission", () => {
    const result = invoiceFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("coerces numeric strings coming from form inputs", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, quantity: "3", rate: "99.5" },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.item.quantity).toBe(3);
      expect(result.data.item.rate).toBe(99.5);
    }
  });

  it("rejects a due date before the invoice date", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      invoiceDate: "2026-07-10",
      dueDate: "2026-07-09",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("dueDate"))).toBe(
        true,
      );
    }
  });

  it("accepts a due date equal to the invoice date", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      dueDate: validInput.invoiceDate,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid customer email", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      customer: { ...validInput.customer, email: "not-an-email" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid mobile number", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      customer: { ...validInput.customer, mobileNumber: "abc" },
    });
    expect(result.success).toBe(false);
  });

  it.each([0, -1, "0", ""])("rejects non-positive quantity %j", (quantity) => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, quantity },
    });
    expect(result.success).toBe(false);
  });

  it.each([Infinity, -Infinity])("rejects a non-finite rate/quantity %j", (value) => {
    const rateResult = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, rate: value },
    });
    expect(rateResult.success).toBe(false);

    const quantityResult = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, quantity: value },
    });
    expect(quantityResult.success).toBe(false);
  });

  it("rejects a quantity/rate above the sane upper bound", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, quantity: 2_000_000, rate: 2_000_000_000 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported currency", () => {
    const result = invoiceFormSchema.safeParse({ ...validInput, currency: "XYZ" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing invoice number", () => {
    const result = invoiceFormSchema.safeParse({ ...validInput, invoiceNumber: "  " });
    expect(result.success).toBe(false);
  });

  it("rejects malformed dates", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      invoiceDate: "10/07/2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unsupported unit of measure", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, itemUOM: "TONS" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing billing address field", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      customer: {
        ...validInput.customer,
        address: { ...validInput.customer.address, city: "" },
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a country code that isn't 2 letters", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      customer: {
        ...validInput.customer,
        address: { ...validInput.customer.address, countryCode: "VNM" },
      },
    });
    expect(result.success).toBe(false);
  });

  it("uppercases the country code", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      customer: {
        ...validInput.customer,
        address: { ...validInput.customer.address, countryCode: "vn" },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customer.address.countryCode).toBe("VN");
    }
  });

  it("rejects a missing bank account field", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      bankAccount: { ...validInput.bankAccount, accountNumber: "" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a blank/omitted bank ID", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      bankAccount: { ...validInput.bankAccount, bankId: undefined },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-alphanumeric account number", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      bankAccount: { ...validInput.bankAccount, accountNumber: "1234-5678" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a zero tax/discount (meaning: not applied)", () => {
    const result = invoiceFormSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.item.taxValue).toBe(0);
      expect(result.data.item.discountValue).toBe(0);
    }
  });

  it("rejects a percentage tax over 100", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, taxType: "PERCENTAGE", taxValue: 150 },
    });
    expect(result.success).toBe(false);
  });

  it("accepts a fixed-value tax over 100", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, taxType: "FIXED_VALUE", taxValue: 150 },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a percentage discount over 100", () => {
    const result = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, discountType: "PERCENTAGE", discountValue: 101 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative tax or discount value", () => {
    const taxResult = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, taxValue: -1 },
    });
    expect(taxResult.success).toBe(false);

    const discountResult = invoiceFormSchema.safeParse({
      ...validInput,
      item: { ...validInput.item, discountValue: -1 },
    });
    expect(discountResult.success).toBe(false);
  });
});
