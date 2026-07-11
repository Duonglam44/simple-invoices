import { describe, expect, it } from "vitest";
import { buildInvoicePayload } from "@/lib/invoice-payload";
import type { InvoiceFormValues } from "@/validation/invoice";

const values: InvoiceFormValues = {
  invoiceNumber: "INV42",
  invoiceReference: "#REF42",
  currency: "GBP",
  invoiceDate: "2026-07-10",
  dueDate: "2026-07-20",
  description: "Test",
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

describe("buildInvoicePayload", () => {
  it("wraps the invoice in the invoices array envelope", () => {
    const payload = buildInvoicePayload(values);
    expect(payload.invoices).toHaveLength(1);
  });

  it("produces exactly one line item, as the assessment requires", () => {
    const payload = buildInvoicePayload(values);
    expect(payload.invoices[0].items).toHaveLength(1);
    expect(payload.invoices[0].items[0]).toMatchObject({
      itemName: "Consulting",
      quantity: 2,
      rate: 150,
      itemUOM: "HRS",
    });
  });

  it("maps customer and invoice fields verbatim", () => {
    const invoice = buildInvoicePayload(values).invoices[0];
    expect(invoice).toMatchObject({
      invoiceNumber: "INV42",
      invoiceReference: "#REF42",
      currency: "GBP",
      invoiceDate: "2026-07-10",
      dueDate: "2026-07-20",
    });
    expect(invoice.customer.contact.email).toBe("nguyen@example.com");
  });

  it("maps the form's bank account and billing address verbatim", () => {
    const invoice = buildInvoicePayload(values).invoices[0];
    expect(invoice.bankAccount).toEqual({
      bankId: "",
      sortCode: "09-01-01",
      accountNumber: "12345678",
      accountName: "John Terry",
    });
    expect(invoice.customer.addresses[0]).toEqual({
      premise: "CT11",
      countryCode: "VN",
      postcode: "1000",
      county: "hoangmai",
      city: "hanoi",
      addressType: "BILLING",
    });
  });

  it("defaults a blank bankId to an empty string", () => {
    const invoice = buildInvoicePayload({
      ...values,
      bankAccount: { ...values.bankAccount, bankId: undefined },
    }).invoices[0];
    expect(invoice.bankAccount.bankId).toBe("");
  });

  it("omits optional fields when they are empty", () => {
    const invoice = buildInvoicePayload({
      ...values,
      invoiceReference: undefined,
      description: undefined,
      item: { ...values.item, description: undefined },
    }).invoices[0];
    expect(invoice).not.toHaveProperty("invoiceReference");
    expect(invoice).not.toHaveProperty("description");
    expect(invoice.items[0]).not.toHaveProperty("description");
  });

  it("omits both the invoice-level and item-level extensions when tax and discount are zero", () => {
    const invoice = buildInvoicePayload(values).invoices[0];
    expect(invoice).not.toHaveProperty("extensions");
    expect(invoice.items[0]).not.toHaveProperty("extensions");
  });

  it("adds an ADD extension for a percentage tax and a DEDUCT extension for a fixed discount", () => {
    const invoice = buildInvoicePayload({
      ...values,
      item: {
        ...values.item,
        taxType: "PERCENTAGE",
        taxValue: 10,
        discountType: "FIXED_VALUE",
        discountValue: 25,
      },
    }).invoices[0];
    expect(invoice.items[0].extensions).toEqual([
      { addDeduct: "ADD", type: "PERCENTAGE", value: 10, name: "Tax" },
      { addDeduct: "DEDUCT", type: "FIXED_VALUE", value: 25, name: "Discount" },
    ]);
  });

  it("only includes the tax extension when the discount is zero", () => {
    const invoice = buildInvoicePayload({
      ...values,
      item: { ...values.item, taxValue: 5 },
    }).invoices[0];
    expect(invoice.items[0].extensions).toEqual([
      { addDeduct: "ADD", type: "PERCENTAGE", value: 5, name: "Tax" },
    ]);
  });

  it("mirrors the same extensions at the invoice level, since the invoice-service sums its totals from there", () => {
    const invoice = buildInvoicePayload({
      ...values,
      item: {
        ...values.item,
        taxType: "PERCENTAGE",
        taxValue: 10,
        discountType: "FIXED_VALUE",
        discountValue: 25,
      },
    }).invoices[0];
    expect(invoice.extensions).toEqual(invoice.items[0].extensions);
    expect(invoice.extensions).toEqual([
      { addDeduct: "ADD", type: "PERCENTAGE", value: 10, name: "Tax" },
      { addDeduct: "DEDUCT", type: "FIXED_VALUE", value: 25, name: "Discount" },
    ]);
  });
});
