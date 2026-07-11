"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePlus2Icon, ReceiptTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Primary pages, shared by the desktop nav and the mobile user dropdown
 * (icons are only rendered in the dropdown).
 */
export const navLinks = [
  { href: "/", label: "Invoices", icon: ReceiptTextIcon },
  { href: "/invoices/new", label: "New invoice", icon: FilePlus2Icon },
] as const;

/** Desktop-only top navigation — on mobile the pages live in the user menu. */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {navLinks.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Button
            key={href}
            asChild
            variant="ghost"
            size="sm"
            className={cn(active && "bg-accent text-accent-foreground")}
          >
            <Link href={href} aria-current={active ? "page" : undefined}>
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
