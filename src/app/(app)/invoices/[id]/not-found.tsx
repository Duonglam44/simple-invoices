import Link from "next/link";
import { ArrowLeft, FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown when the invoice detail page calls notFound(): the id is malformed,
 * the invoice was deleted, or it belongs to another organisation. Renders
 * inside the app layout so the header navigation stays available.
 */
export default function InvoiceNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center sm:py-20">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <FileQuestion className="text-muted-foreground size-7" aria-hidden />
      </div>
      <h1 className="mt-5 text-xl font-bold tracking-tight">Invoice not found</h1>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        The invoice you&apos;re looking for doesn&apos;t exist or may have been
        deleted. Double-check the link, or head back to your invoice list.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Back to invoices
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/invoices/new">
            <Plus className="size-4" aria-hidden />
            New invoice
          </Link>
        </Button>
      </div>
    </div>
  );
}
