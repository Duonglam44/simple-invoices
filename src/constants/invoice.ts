export const SORT_FIELDS = [
  "CREATED_DATE",
  "INVOICE_DATE",
  "DUE_DATE",
  "TOTAL_AMOUNT",
  "DUE_AMOUNT",
] as const;

export const CLIENT_SORT_FIELDS = ["DISCOUNT"] as const;

export const STATUS_FILTERS = ["Paid", "Due", "Overdue"] as const;

export const PAGE_SIZES = [10, 20, 50] as const;

export const DEFAULT_SORT_BY = "CREATED_DATE";
export const DEFAULT_ORDERING = "DESCENDING";

export const SUPPORTED_CURRENCIES = [
  "GBP",
  "USD",
  "EUR",
  "SGD",
  "VND",
  "LKR",
] as const;

/** Units of measure accepted by the invoice-service `items[].itemUOM` field. */
export const ITEM_UOM_OPTIONS = [
  "EA",
  "HRS",
  "DAY",
  "KG",
  "PCS",
  "BOX",
  "SET",
  "LTR",
  "MTR",
] as const;

/** Human-readable labels for `ITEM_UOM_OPTIONS` — the API only accepts the short codes. */
export const ITEM_UOM_LABELS: Record<
  (typeof ITEM_UOM_OPTIONS)[number],
  string
> = {
  EA: "Each (EA)",
  HRS: "Hours (HRS)",
  DAY: "Days (DAY)",
  KG: "Kilogram (KG)",
  PCS: "Pieces (PCS)",
  BOX: "Box (BOX)",
  SET: "Set (SET)",
  LTR: "Litre (LTR)",
  MTR: "Metre (MTR)",
};

/** How a tax/discount `extensions[]` entry's `value` is interpreted. */
export const EXTENSION_TYPES = ["PERCENTAGE", "FIXED_VALUE"] as const;

/** Matches the invoice-service's invoiceId shape (a UUID). */
export const INVOICE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** yyyy-MM-dd — shared by the list-query date filters and the invoice form schema. */
export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const INVOICE_CSV_HEADERS = [
  "Invoice Number",
  "Reference",
  "Customer",
  "Description",
  "Invoice Date",
  "Due Date",
  "Created At",
  "Currency",
  "Subtotal",
  "Discount",
  "Tax",
  "Total",
  "Paid",
  "Balance",
  "Status",
];

export const DEFAULT_BANK_ACCOUNT = {
  bankId: "",
  sortCode: "09-01-01",
  accountNumber: "12345678",
  accountName: "John Terry",
} as const;

export const DEFAULT_BILLING_ADDRESS = {
  premise: "",
  countryCode: "",
  postcode: "",
  county: "",
  city: "",
} as const;
