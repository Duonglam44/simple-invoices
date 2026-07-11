"use client";

import { useRouter } from "next/navigation";
import { useInvoiceUiStore } from "@/stores/invoice-ui-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateInvoiceForm } from "@/components/invoices/CreateInvoice/CreateInvoiceForm";

export function CreateInvoiceDialog() {
  const router = useRouter();
  const open = useInvoiceUiStore((state) => state.isCreateOpen);
  const closeCreate = useInvoiceUiStore((state) => state.closeCreate);

  function handleDone() {
    closeCreate();
    router.push("/");
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeCreate()}>
      <DialogContent
        mobileSheet
        className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl lg:max-w-4xl"
      >
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Create invoice</DialogTitle>
          <DialogDescription>
            Fill in the details below. Each invoice contains a single line item.
          </DialogDescription>
        </DialogHeader>
        <CreateInvoiceForm
          persistDraft
          onDone={handleDone}
          onCancel={closeCreate}
        />
      </DialogContent>
    </Dialog>
  );
}
