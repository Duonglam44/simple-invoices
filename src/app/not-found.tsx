import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Catch-all 404 for URLs that don't match any route. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="text-lg font-bold tracking-tight">
        Simple<span className="text-primary">Invoice</span>
      </p>
      <p className="text-primary mt-8 text-sm font-semibold">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">
          <ArrowLeft className="size-4" aria-hidden />
          Back to invoices
        </Link>
      </Button>
    </div>
  );
}
