"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Shared URL-state navigation for the invoice list. All list state (search,
 * filters, sort, pagination) lives in the URL; this hook applies partial
 * changes on top of the current params. Filter/sort changes reset to page 1
 * (the default); pagination itself opts out via `resetPage: false`.
 */
export function useListNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function apply(
    changes: Record<string, string>,
    { resetPage = true }: { resetPage?: boolean } = {},
  ) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    router.push(pathname);
  }

  return { searchParams, apply, reset };
}
