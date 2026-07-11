import { z } from "zod";
import {
  EXTENSION_TYPES,
  ISO_DATE_PATTERN,
  ITEM_UOM_OPTIONS,
  SUPPORTED_CURRENCIES,
} from "@/constants/invoice";

function adjustmentValue(label: string) {
  return z.coerce
    .number({ message: `${label} must be a number` })
    .finite(`${label} must be a finite number`)
    .min(0, `${label} can't be negative`)
    .max(1_000_000_000, `${label} must be 1,000,000,000 or fewer`);
}

const isoDate = z
  .string()
  .min(1, "Required")
  .regex(ISO_DATE_PATTERN, "Must be a date in YYYY-MM-DD format");

export const invoiceFormSchema = z
  .object({
    invoiceNumber: z
      .string()
      .trim()
      .min(1, "Invoice number is required")
      .max(50, "Must be 50 characters or fewer")
      .regex(/^[A-Za-z0-9#_-]+$/, "Only letters, digits, #, - and _ are allowed"),
    invoiceReference: z.string().trim().max(50, "Must be 50 characters or fewer").optional(),
    currency: z.enum(SUPPORTED_CURRENCIES, { message: "Select a currency" }),
    invoiceDate: isoDate,
    dueDate: isoDate,
    description: z.string().trim().max(500, "Must be 500 characters or fewer").optional(),
    customer: z.object({
      firstName: z.string().trim().min(1, "First name is required").max(100),
      lastName: z.string().trim().min(1, "Last name is required").max(100),
      email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
      mobileNumber: z
        .string()
        .trim()
        .min(1, "Mobile number is required")
        .regex(/^\+?\d{6,15}$/, "Must be a valid phone number, e.g. +6597594971"),
      address: z.object({
        premise: z.string().trim().min(1, "Address line is required").max(100),
        city: z.string().trim().min(1, "City is required").max(100),
        county: z.string().trim().min(1, "County/state is required").max(100),
        postcode: z.string().trim().min(1, "Postcode is required").max(20),
        countryCode: z
          .string()
          .trim()
          .min(1, "Country is required")
          .regex(/^[A-Za-z]{2}$/, "Must be a 2-letter ISO country code, e.g. GB")
          .transform((value) => value.toUpperCase()),
      }),
    }),
    bankAccount: z.object({
      bankId: z.string().trim().max(50).optional(),
      sortCode: z.string().trim().min(1, "Sort code is required").max(20),
      accountNumber: z
        .string()
        .trim()
        .min(1, "Account number is required")
        .max(34, "Must be 34 characters or fewer")
        .regex(/^[A-Za-z0-9]+$/, "Only letters and digits are allowed"),
      accountName: z.string().trim().min(1, "Account name is required").max(100),
    }),
    item: z.object({
      itemName: z.string().trim().min(1, "Item name is required").max(200),
      description: z.string().trim().max(500).optional(),
      quantity: z.coerce
        .number({ message: "Quantity must be a number" })
        .finite("Quantity must be a finite number")
        .positive("Quantity must be greater than 0")
        .max(1_000_000, "Quantity must be 1,000,000 or fewer"),
      rate: z.coerce
        .number({ message: "Rate must be a number" })
        .finite("Rate must be a finite number")
        .positive("Rate must be greater than 0")
        .max(1_000_000_000, "Rate must be 1,000,000,000 or fewer"),
      itemUOM: z.enum(ITEM_UOM_OPTIONS, { message: "Select a unit of measure" }),
      // Optional ADD/DEDUCT adjustments — 0 means "not applied" and is
      // dropped from the `extensions[]` array built for the API request.
      taxType: z.enum(EXTENSION_TYPES),
      taxValue: adjustmentValue("Tax"),
      discountType: z.enum(EXTENSION_TYPES),
      discountValue: adjustmentValue("Discount"),
    }),
  })
  .refine((data) => data.dueDate >= data.invoiceDate, {
    // ISO dates compare correctly as strings.
    message: "Due date cannot be before the invoice date",
    path: ["dueDate"],
  })
  .refine((data) => data.item.taxType !== "PERCENTAGE" || data.item.taxValue <= 100, {
    message: "Percentage tax can't exceed 100",
    path: ["item", "taxValue"],
  })
  .refine(
    (data) => data.item.discountType !== "PERCENTAGE" || data.item.discountValue <= 100,
    { message: "Percentage discount can't exceed 100", path: ["item", "discountValue"] },
  );

export type InvoiceFormInput = z.input<typeof invoiceFormSchema>;
export type InvoiceFormValues = z.output<typeof invoiceFormSchema>;
