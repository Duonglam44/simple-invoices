"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Boundary for unexpected failures while loading an invoice (upstream 5xx,
 * network errors). 404s are handled by not-found.tsx instead.
 */
export default function InvoiceDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center sm:py-20">
      <div className="bg-destructive/10 flex size-14 items-center justify-center rounded-full">
        <TriangleAlert className="text-destructive size-7" aria-hidden />
      </div>
      <h1 className="mt-5 text-xl font-bold tracking-tight">
        Couldn&apos;t load this invoice
      </h1>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        Something went wrong on our side while fetching the invoice. It&apos;s
        usually temporary — try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={reset}>
          <RotateCcw className="size-4" aria-hidden />
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Back to invoices
          </Link>
        </Button>
      </div>
    </div>
  );
}
