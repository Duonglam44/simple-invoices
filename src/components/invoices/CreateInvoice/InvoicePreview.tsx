import type { InvoiceFormValues } from "@/validation/invoice";
import { ITEM_UOM_LABELS } from "@/constants/invoice";
import { currencySymbol, formatDate, formatMoney } from "@/lib/format";
import { computeTotals, formatAdjustment } from "@/lib/invoice-totals";
import { FormSection } from "@/components/invoices/CreateInvoice/FormSection";

export function PreviewField({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-sm font-medium break-words">
        {value === undefined || value === null || value === "" ? "—" : value}
      </p>
    </div>
  );
}

export function TotalsBreakdown({
  subtotal,
  taxAmount,
  discountAmount,
  total,
  currency,
}: {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
}) {
  return (
    <div className="bg-muted mt-3 space-y-1 rounded-lg px-4 py-3 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatMoney(subtotal, currency)}</span>
      </div>
      {taxAmount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>+{formatMoney(taxAmount, currency)}</span>
        </div>
      )}
      {discountAmount > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span>-{formatMoney(discountAmount, currency)}</span>
        </div>
      )}
      <div className="flex items-center justify-between border-t pt-1 font-semibold">
        <span>Total</span>
        <span className="text-base">{formatMoney(total, currency)}</span>
      </div>
    </div>
  );
}

export function InvoicePreview({ values }: { values: InvoiceFormValues }) {
  const { subtotal, taxAmount, discountAmount, total } = computeTotals(
    values.item,
  );

  return (
    <div className="space-y-4" data-testid="invoice-preview">
      <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-2">
        <div className="space-y-4">
          <FormSection title="Invoice details" first>
            <PreviewField label="Invoice number" value={values.invoiceNumber} />
            <PreviewField label="Reference" value={values.invoiceReference} />
            <PreviewField
              label="Invoice date"
              value={formatDate(values.invoiceDate)}
            />
            <PreviewField label="Due date" value={formatDate(values.dueDate)} />
            <PreviewField
              label="Currency"
              value={`${values.currency} (${currencySymbol(values.currency)})`}
            />
            <div className="sm:col-span-2">
              <PreviewField label="Description" value={values.description} />
            </div>
          </FormSection>

          <FormSection title="Line item">
            <PreviewField label="Item name" value={values.item.itemName} />
            <PreviewField
              label="Item description"
              value={values.item.description}
            />
            <PreviewField label="Quantity" value={values.item.quantity} />
            <PreviewField
              label="Rate (unit price)"
              value={formatMoney(values.item.rate, values.currency)}
            />
            <PreviewField
              label="Unit of measure"
              value={ITEM_UOM_LABELS[values.item.itemUOM]}
            />
            <PreviewField
              label="Tax"
              value={
                values.item.taxValue > 0
                  ? formatAdjustment(values.item.taxValue, values.item.taxType)
                  : undefined
              }
            />
            <PreviewField
              label="Discount"
              value={
                values.item.discountValue > 0
                  ? formatAdjustment(
                      values.item.discountValue,
                      values.item.discountType,
                    )
                  : undefined
              }
            />
          </FormSection>
        </div>

        <div className="space-y-4 lg:border-l lg:pl-6">
          <FormSection title="Customer" first>
            <PreviewField
              label="Name"
              value={`${values.customer.firstName} ${values.customer.lastName}`}
            />
            <PreviewField label="Email" value={values.customer.email} />
            <PreviewField
              label="Mobile number"
              value={values.customer.mobileNumber}
            />
          </FormSection>

          <FormSection title="Bank / remittance details">
            <PreviewField
              label="Account name"
              value={values.bankAccount.accountName}
            />
            <PreviewField
              label="Account number"
              value={values.bankAccount.accountNumber}
            />
            <PreviewField
              label="Sort code"
              value={values.bankAccount.sortCode}
            />
            <PreviewField label="Bank ID" value={values.bankAccount.bankId} />
          </FormSection>

          <FormSection title="Billing address">
            <div className="sm:col-span-2">
              <PreviewField
                label="Address line"
                value={values.customer.address.premise}
              />
            </div>
            <PreviewField label="City" value={values.customer.address.city} />
            <PreviewField
              label="County / state"
              value={values.customer.address.county}
            />
            <PreviewField
              label="Postcode"
              value={values.customer.address.postcode}
            />
            <PreviewField
              label="Country code"
              value={values.customer.address.countryCode}
            />
          </FormSection>
        </div>
      </div>

      <div className="border-t">
        <TotalsBreakdown
          subtotal={subtotal}
          taxAmount={taxAmount}
          discountAmount={discountAmount}
          total={total}
          currency={values.currency}
        />
      </div>
    </div>
  );
}
