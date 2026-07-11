"use client";

import { memo } from "react";
import {
  useFormState,
  useWatch,
  type UseFormReturn,
} from "react-hook-form";
import type {
  InvoiceFormInput,
  InvoiceFormValues,
} from "@/validation/invoice";
import {
  ITEM_UOM_LABELS,
  ITEM_UOM_OPTIONS,
  SUPPORTED_CURRENCIES,
} from "@/constants/invoice";
import { currencySymbol } from "@/lib/format";
import { computeTotals } from "@/lib/invoice-totals";
import { FormSection } from "@/components/invoices/CreateInvoice/FormSection";
import { AdjustmentField } from "@/components/custom/AdjustmentField";
import { DateField } from "@/components/custom/DateField";
import { SelectField } from "@/components/custom/SelectField";
import { TextareaField } from "@/components/custom/TextareaField";
import { TextField } from "@/components/custom/TextField";
import { TotalsBreakdown } from "@/components/invoices/CreateInvoice/InvoicePreview";

const CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((code) => ({
  value: code,
  label: `${code} (${currencySymbol(code)})`,
}));

const UOM_OPTIONS = ITEM_UOM_OPTIONS.map((uom) => ({
  value: uom,
  label: ITEM_UOM_LABELS[uom],
}));

type FormApi = Pick<
  UseFormReturn<InvoiceFormInput, unknown, InvoiceFormValues>,
  "control" | "register" | "setValue"
>;

function LiveTotals({ control }: Pick<FormApi, "control">) {
  const [quantity, rate, taxType, taxValue, discountType, discountValue, currency] =
    useWatch({
      control,
      name: [
        "item.quantity",
        "item.rate",
        "item.taxType",
        "item.taxValue",
        "item.discountType",
        "item.discountValue",
        "currency",
      ],
    });

  const { subtotal, taxAmount, discountAmount, total } = computeTotals({
    quantity: Number(quantity) || 0,
    rate: Number(rate) || 0,
    taxType: taxType ?? "PERCENTAGE",
    taxValue: Number(taxValue) || 0,
    discountType: discountType ?? "PERCENTAGE",
    discountValue: Number(discountValue) || 0,
  });

  return (
    <div className="border-t">
      <TotalsBreakdown
        subtotal={subtotal}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        total={total}
        currency={currency ?? "GBP"}
      />
    </div>
  );
}

export const InvoiceFormFields = memo(function InvoiceFormFields({
  control,
  register,
  setValue,
}: FormApi) {
  const { errors } = useFormState({ control });
  const [invoiceDate, dueDate, currency, itemUOM, taxType, discountType] =
    useWatch({
      control,
      name: [
        "invoiceDate",
        "dueDate",
        "currency",
        "item.itemUOM",
        "item.taxType",
        "item.discountType",
      ],
    });

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-2">
        <div className="space-y-4">
          <FormSection title="Invoice details" first>
            <TextField
              id="invoiceNumber"
              label="Invoice number"
              required
              error={errors.invoiceNumber?.message}
              {...register("invoiceNumber")}
            />
            <TextField
              id="invoiceReference"
              label="Reference"
              placeholder="e.g. #PO-2026-001"
              error={errors.invoiceReference?.message}
              {...register("invoiceReference")}
            />
            <DateField
              id="invoiceDate"
              label="Invoice date"
              required
              error={errors.invoiceDate?.message}
              value={invoiceDate}
              onChange={(value) =>
                setValue("invoiceDate", value, { shouldValidate: true })
              }
            />
            <DateField
              id="dueDate"
              label="Due date"
              required
              error={errors.dueDate?.message}
              value={dueDate}
              min={invoiceDate}
              onChange={(value) =>
                setValue("dueDate", value, { shouldValidate: true })
              }
            />
            <SelectField
              id="currency"
              label="Currency"
              required
              error={errors.currency?.message}
              value={currency ?? "GBP"}
              onValueChange={(value) =>
                setValue("currency", value as InvoiceFormInput["currency"], {
                  shouldValidate: true,
                })
              }
              options={CURRENCY_OPTIONS}
            />
            <TextareaField
              id="description"
              label="Description"
              className="sm:col-span-2"
              rows={2}
              placeholder="What is this invoice for?"
              error={errors.description?.message}
              {...register("description")}
            />
          </FormSection>

          <FormSection title="Line item">
            <TextField
              id="itemName"
              label="Item name"
              required
              placeholder="e.g. Consulting"
              error={errors.item?.itemName?.message}
              {...register("item.itemName")}
            />
            <TextField
              id="itemDescription"
              label="Item description"
              error={errors.item?.description?.message}
              {...register("item.description")}
            />
            <TextField
              id="itemQuantity"
              label="Quantity"
              required
              type="number"
              min="0"
              step="any"
              error={errors.item?.quantity?.message}
              {...register("item.quantity")}
            />
            <TextField
              id="itemRate"
              label="Rate (unit price)"
              required
              type="number"
              min="0"
              step="any"
              error={errors.item?.rate?.message}
              {...register("item.rate")}
            />
            <AdjustmentField
              id="itemDiscountValue"
              label="Discount"
              type={discountType ?? "PERCENTAGE"}
              onTypeChange={(value) =>
                setValue("item.discountType", value, { shouldValidate: true })
              }
              error={errors.item?.discountValue?.message}
              valueProps={register("item.discountValue")}
            />
            <AdjustmentField
              id="itemTaxValue"
              label="Tax"
              type={taxType ?? "PERCENTAGE"}
              onTypeChange={(value) =>
                setValue("item.taxType", value, { shouldValidate: true })
              }
              error={errors.item?.taxValue?.message}
              valueProps={register("item.taxValue")}
            />
            <SelectField
              id="itemUOM"
              label="Unit of measure"
              required
              error={errors.item?.itemUOM?.message}
              value={itemUOM ?? "EA"}
              onValueChange={(value) =>
                setValue(
                  "item.itemUOM",
                  value as InvoiceFormInput["item"]["itemUOM"],
                  { shouldValidate: true },
                )
              }
              options={UOM_OPTIONS}
            />
          </FormSection>
        </div>

        <div className="space-y-4 lg:border-l lg:pl-6">
          <FormSection title="Customer" first>
            <TextField
              id="customerFirstName"
              label="First name"
              required
              autoComplete="off"
              error={errors.customer?.firstName?.message}
              {...register("customer.firstName")}
            />
            <TextField
              id="customerLastName"
              label="Last name"
              required
              autoComplete="off"
              error={errors.customer?.lastName?.message}
              {...register("customer.lastName")}
            />
            <TextField
              id="customerEmail"
              label="Email"
              required
              type="email"
              placeholder="name@example.com"
              error={errors.customer?.email?.message}
              {...register("customer.email")}
            />
            <TextField
              id="customerMobile"
              label="Mobile number"
              required
              type="tel"
              placeholder="+6597594971"
              error={errors.customer?.mobileNumber?.message}
              {...register("customer.mobileNumber")}
            />
          </FormSection>

          <FormSection title="Bank / remittance details">
            <TextField
              id="bankAccountName"
              label="Account name"
              required
              error={errors.bankAccount?.accountName?.message}
              {...register("bankAccount.accountName")}
            />
            <TextField
              id="bankAccountNumber"
              label="Account number"
              required
              error={errors.bankAccount?.accountNumber?.message}
              {...register("bankAccount.accountNumber")}
            />
            <TextField
              id="bankSortCode"
              label="Sort code"
              required
              placeholder="e.g. 09-01-01"
              error={errors.bankAccount?.sortCode?.message}
              {...register("bankAccount.sortCode")}
            />
            <TextField
              id="bankId"
              label="Bank ID"
              error={errors.bankAccount?.bankId?.message}
              {...register("bankAccount.bankId")}
            />
          </FormSection>

          <FormSection title="Billing address">
            <TextField
              id="addressPremise"
              label="Address line"
              required
              className="sm:col-span-2"
              placeholder="e.g. Unit 4, 12 High Street"
              error={errors.customer?.address?.premise?.message}
              {...register("customer.address.premise")}
            />
            <TextField
              id="addressCity"
              label="City"
              required
              error={errors.customer?.address?.city?.message}
              {...register("customer.address.city")}
            />
            <TextField
              id="addressCounty"
              label="County / state"
              required
              error={errors.customer?.address?.county?.message}
              {...register("customer.address.county")}
            />
            <TextField
              id="addressPostcode"
              label="Postcode"
              required
              error={errors.customer?.address?.postcode?.message}
              {...register("customer.address.postcode")}
            />
            <TextField
              id="addressCountryCode"
              label="Country code"
              required
              placeholder="e.g. GB"
              maxLength={2}
              inputClassName="uppercase"
              error={errors.customer?.address?.countryCode?.message}
              {...register("customer.address.countryCode")}
            />
          </FormSection>
        </div>
      </div>

      {/* Always full width, below both columns. */}
      <LiveTotals control={control} />
    </div>
  );
});
