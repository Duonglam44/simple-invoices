import type { Metadata } from "next";
import { NewInvoiceView } from "@/components/invoices/NewInvoiceView";

export const metadata: Metadata = { title: "New invoice" };

export default function NewInvoicePage() {
  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl">
      <h1 className="text-xl font-bold sm:text-2xl">Create invoice</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Fill in the details below. Each invoice contains a single line item.
      </p>
      <div className="bg-card mt-5 rounded-xl border p-5 shadow-sm sm:p-6">
        <NewInvoiceView />
      </div>
    </div>
  );
}
