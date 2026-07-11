export interface InvoiceStatusEntry {
  key: string;
  value: boolean;
}

export interface KeyValueField {
  key: string;
  value: string;
}

export interface InvoiceAddress {
  addressType?: string;
  premise?: string;
  city?: string;
  county?: string;
  countryCode?: string;
  postcode?: string;
}

export interface InvoiceCustomer {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  contact?: {
    email?: string;
    mobileNumber?: string;
  };
  addresses?: InvoiceAddress[];
}

export interface InvoiceMerchant {
  id?: string;
  name?: string;
  addresses?: InvoiceAddress[];
}

export interface InvoiceLineItem {
  orderIndex?: number;
  itemReference?: string;
  itemName?: string;
  description?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
  netAmount?: number;
  itemUOM?: string;
  customFields?: KeyValueField[];
  extensions?: unknown[];
}

export interface InvoiceBankAccount {
  bankId?: string;
  sortCode?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface InvoiceListItem {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  createdAt: string;
  createdBy?: string;
  currency: string;
  currencySymbol?: string;
  description?: string;
  /** Same value is exposed under both names by the service. */
  referenceNo?: string;
  invoiceReference?: string;
  customer?: InvoiceCustomer;
  merchant?: InvoiceMerchant;
  invoiceSubTotal?: number;
  invoiceGrossTotal?: number;
  totalDiscount?: number;
  totalTax?: number;
  totalAmount: number;
  totalPaid?: number;
  balanceAmount?: number;
  numberOfDocuments?: number;
  documents?: unknown[];
  items?: unknown[];
  payments?: unknown[];
  status: InvoiceStatusEntry[];
  subStatus?: InvoiceStatusEntry[];
  customFields?: KeyValueField[];
  type?: string;
  version?: string;
}

export interface InvoiceDetail extends Omit<
  InvoiceListItem,
  "items" | "createdAt"
> {
  createdAt?: string;
  items?: InvoiceLineItem[];
  bankAccount?: InvoiceBankAccount;
}

export interface InvoiceDetailResponse {
  data: InvoiceDetail;
}

export interface Paging {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}

export interface InvoiceListResponse {
  data: InvoiceListItem[];
  paging: Paging;
}

export interface InvoiceListQuery {
  pageNum: number;
  pageSize: number;
  sortBy: string;
  ordering: "ASCENDING" | "DESCENDING";
  keyword?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

/** Body accepted by POST /invoice-service/1.0.0/invoices */
export interface CreateInvoicePayload {
  invoices: Array<{
    bankAccount: {
      bankId: string;
      sortCode: string;
      accountNumber: string;
      accountName: string;
    };
    customer: {
      firstName: string;
      lastName: string;
      contact: {
        email: string;
        mobileNumber: string;
      };
      addresses: Array<{
        premise: string;
        countryCode: string;
        postcode: string;
        county: string;
        city: string;
        addressType: "BILLING";
      }>;
    };
    invoiceReference?: string;
    invoiceNumber: string;
    currency: string;
    invoiceDate: string;
    dueDate: string;
    description?: string;
    /** Invoice-level tax/discount — what the service sums into
     * `invoiceSubTotal` / `totalTax` / `totalDiscount` / `totalAmount`. */
    extensions?: Array<{
      addDeduct: "ADD" | "DEDUCT";
      type: "PERCENTAGE" | "FIXED_VALUE";
      value: number;
      name: string;
    }>;
    items: Array<{
      itemReference: string;
      itemName: string;
      description?: string;
      quantity: number;
      rate: number;
      itemUOM: string;
      extensions?: Array<{
        addDeduct: "ADD" | "DEDUCT";
        type: "PERCENTAGE" | "FIXED_VALUE";
        value: number;
        name: string;
      }>;
    }>;
  }>;
}
