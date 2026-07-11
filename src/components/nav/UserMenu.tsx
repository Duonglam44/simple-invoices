"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDownIcon, Loader2Icon, LogOutIcon } from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { navLinks } from "@/components/nav/NavLinks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** "Nguyen Van A" → "NA"; single-word names fall back to the first two letters. */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const chars =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : parts[0][0] + parts[parts.length - 1][0];
  return chars.toUpperCase();
}

/**
 * User dropdown in the header: avatar + name trigger opening a menu with the
 * account info and sign-out. On mobile (< sm) it also hosts the page links,
 * since the inline top navigation is hidden there.
 */
export function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 px-1.5 sm:px-2"
          aria-label="Open user menu"
        >
          <span
            aria-hidden
            className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-full text-xs font-semibold"
          >
            {user ? initials(user.name) : "?"}
          </span>
          {user && (
            <span className="hidden max-w-30 truncate text-sm font-medium sm:block">
              {user.name}
            </span>
          )}
          <ChevronDownIcon className="size-3.5 text-muted-foreground transition-transform duration-200 group-aria-expanded/button:rotate-180" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate">{user?.name ?? "Signed in"}</span>
          {user?.orgName && (
            <span className="text-muted-foreground truncate text-xs font-normal">
              {user.orgName}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Page links — only on mobile, where the inline nav is hidden */}
        <DropdownMenuGroup className="sm:hidden">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <DropdownMenuItem
                key={href}
                asChild
                className={cn(active && "bg-accent text-accent-foreground")}
              >
                <Link href={href} aria-current={active ? "page" : undefined}>
                  <Icon />
                  {label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="sm:hidden" />

        <DropdownMenuItem
          variant="destructive"
          disabled={busy}
          onSelect={(event) => {
            // Keep the menu open so the "Signing out…" state stays visible
            // until the redirect to /login happens.
            event.preventDefault();
            void handleLogout();
          }}
        >
          {busy ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
          {busy ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
