import type { InvoiceFormValues } from "@/validation/invoice";
import type { CreateInvoicePayload } from "@/lib/types";

type ItemExtension = NonNullable<
  CreateInvoicePayload["invoices"][number]["items"][number]["extensions"]
>[number];

/** A zero value means "not applied" — the extension is left out of the payload entirely. */
function buildItemExtensions(item: InvoiceFormValues["item"]): ItemExtension[] {
  const extensions: ItemExtension[] = [];
  if (item.taxValue > 0) {
    extensions.push({
      addDeduct: "ADD",
      type: item.taxType,
      value: item.taxValue,
      name: "Tax",
    });
  }
  if (item.discountValue > 0) {
    extensions.push({
      addDeduct: "DEDUCT",
      type: item.discountType,
      value: item.discountValue,
      name: "Discount",
    });
  }
  return extensions;
}

/** Maps validated form values to the invoice-service request body. */
export function buildInvoicePayload(
  values: InvoiceFormValues,
): CreateInvoicePayload {
  const extensions = buildItemExtensions(values.item);
  return {
    invoices: [
      {
        bankAccount: {
          bankId: values.bankAccount.bankId ?? "",
          sortCode: values.bankAccount.sortCode,
          accountNumber: values.bankAccount.accountNumber,
          accountName: values.bankAccount.accountName,
        },
        customer: {
          firstName: values.customer.firstName,
          lastName: values.customer.lastName,
          contact: {
            email: values.customer.email,
            mobileNumber: values.customer.mobileNumber,
          },
          addresses: [
            {
              premise: values.customer.address.premise,
              countryCode: values.customer.address.countryCode,
              postcode: values.customer.address.postcode,
              county: values.customer.address.county,
              city: values.customer.address.city,
              addressType: "BILLING",
            },
          ],
        },
        ...(values.invoiceReference
          ? { invoiceReference: values.invoiceReference }
          : {}),
        invoiceNumber: values.invoiceNumber,
        currency: values.currency,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate,
        ...(values.description ? { description: values.description } : {}),
        ...(extensions.length > 0 ? { extensions } : {}),
        // The assessment specifies exactly one line item per invoice.
        items: [
          {
            itemReference: values.invoiceNumber,
            itemName: values.item.itemName,
            ...(values.item.description
              ? { description: values.item.description }
              : {}),
            quantity: values.item.quantity,
            rate: values.item.rate,
            itemUOM: values.item.itemUOM,
            ...(extensions.length > 0 ? { extensions } : {}),
          },
        ],
      },
    ],
  };
}
