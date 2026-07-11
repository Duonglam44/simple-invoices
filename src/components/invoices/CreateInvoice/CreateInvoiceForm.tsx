"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addDays } from "date-fns";
import { toISODate } from "@/lib/date";
import { useInvoiceUiStore } from "@/stores/invoice-ui-store";
import {
  invoiceFormSchema,
  type InvoiceFormInput,
  type InvoiceFormValues,
} from "@/validation/invoice";
import {
  DEFAULT_BANK_ACCOUNT,
  DEFAULT_BILLING_ADDRESS,
} from "@/constants/invoice";
import { createInvoiceRequest } from "@/client/invoices";
import { Button } from "@/components/ui/button";
import { InvoiceFormFields } from "@/components/invoices/CreateInvoice/InvoiceFormFields";
import { InvoicePreview } from "@/components/invoices/CreateInvoice/InvoicePreview";

function todayISO(): string {
  return toISODate(new Date());
}

function defaultDueDateISO(): string {
  return toISODate(addDays(new Date(), 7));
}

function defaultInvoiceNumber(): string {
  return `INV${Date.now()}`;
}

function blankInvoice(): InvoiceFormInput {
  return {
    invoiceNumber: defaultInvoiceNumber(),
    invoiceReference: "",
    currency: "GBP",
    invoiceDate: todayISO(),
    dueDate: defaultDueDateISO(),
    description: "",
    customer: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      address: { ...DEFAULT_BILLING_ADDRESS },
    },
    bankAccount: { ...DEFAULT_BANK_ACCOUNT },
    item: {
      itemName: "",
      description: "",
      quantity: 1,
      rate: 0,
      itemUOM: "EA",
      taxType: "PERCENTAGE",
      taxValue: 0,
      discountType: "PERCENTAGE",
      discountValue: 0,
    },
  };
}

type Step = "edit" | "preview";

interface CreateInvoiceFormProps {
  onDone?: () => void;
  onCancel?: () => void;
  persistDraft?: boolean;
  layout?: "modal" | "page";
}

export function CreateInvoiceForm({
  onDone,
  onCancel,
  persistDraft = false,
  layout = "modal",
}: CreateInvoiceFormProps) {
  const queryClient = useQueryClient();
  const setDraft = useInvoiceUiStore((state) => state.setDraft);
  const clearDraft = useInvoiceUiStore((state) => state.clearDraft);

  const defaults = useMemo<InvoiceFormInput>(
    () => (persistDraft && useInvoiceUiStore.getState().draft) || blankInvoice(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { register, handleSubmit, watch, setValue, reset, control } = useForm<
    InvoiceFormInput,
    unknown,
    InvoiceFormValues
  >({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (!persistDraft) return;
    // eslint-disable-next-line
    const subscription = watch((values) =>
      setDraft(values as InvoiceFormInput),
    );
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistDraft, setDraft]);

  const [step, setStep] = useState<Step>("edit");
  const [previewValues, setPreviewValues] = useState<InvoiceFormValues | null>(
    null,
  );

  const createInvoice = useMutation({
    mutationFn: createInvoiceRequest,
    onSuccess: (_data, values) => {
      toast.success("Invoice created successfully", {
        description: `Invoice ${values.invoiceNumber} has been submitted.`,
      });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      if (persistDraft) clearDraft();
      setStep("edit");
      setPreviewValues(null);
      onDone?.();
    },
  });

  const handleCancel = useCallback(() => {
    reset();
    if (persistDraft) clearDraft();
    onCancel?.();
  }, [reset, persistDraft, clearDraft, onCancel]);

  const handleReset = useCallback(() => {
    reset(blankInvoice());
    setStep("edit");
  }, [reset]);

  const onPreview = handleSubmit((values) => {
    setPreviewValues(values);
    setStep("preview");
  });

  const handleBackToEdit = useCallback(() => {
    setStep("edit");
  }, []);

  const handleCreate = useCallback(() => {
    if (!previewValues) return;
    createInvoice.mutate(previewValues);
  }, [previewValues, createInvoice])

  const isModal = useMemo(() => layout === "modal", [layout]);

  const screens: Record<Step, React.ReactNode> = {
    edit: (
      <InvoiceFormFields
        control={control}
        register={register}
        setValue={setValue}
      />
    ),
    preview: previewValues && <InvoicePreview values={previewValues} />,
  };

  return (
    <form
      onSubmit={onPreview}
      noValidate
      className={isModal ? "flex min-h-0 flex-1 flex-col" : undefined}
    >
      {/* Modal: scrollable body between fixed header and footer */}
      <div
        className={
          isModal
            ? "min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4"
            : "space-y-4"
        }
      >
        {createInvoice.isError && (
          <div
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
          >
            {createInvoice.error.message}
          </div>
        )}

        {screens[step]}
      </div>

      {/* Footer actions (fixed in the modal variant) */}
      <div
        className={
          isModal
            ? "bg-background flex justify-end gap-2 rounded-b-lg border-t px-6 py-4 max-sm:rounded-b-none"
            : "mt-5 flex justify-end gap-2 border-t pt-4"
        }
      >
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createInvoice.isPending}
          >
            Cancel
          </Button>
        )}
        {step === "edit" ? (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={createInvoice.isPending}
            >
              Reset
            </Button>
            <Button type="submit">Preview</Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleBackToEdit}
              disabled={createInvoice.isPending}
            >
              Back to edit
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={createInvoice.isPending}
            >
              {createInvoice.isPending ? "Creating invoice…" : "Create invoice"}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
