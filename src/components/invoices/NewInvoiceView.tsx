"use client";

import { useRouter } from "next/navigation";
import { CreateInvoiceForm } from "@/components/invoices/CreateInvoice/CreateInvoiceForm";

export function NewInvoiceView() {
  const router = useRouter();

  return (
    <CreateInvoiceForm
      layout="page"
      onDone={() => router.push("/")}
      onCancel={() => router.push("/")}
    />
  );
}
