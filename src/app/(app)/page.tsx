import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getSession } from "@/lib/session";
import { listInvoices } from "@/api/invoices";
import { parseListQuery } from "@/lib/list-query";
import { getQueryClient, invoicesQueryKey } from "@/lib/query-client";
import { InvoiceListView } from "@/components/invoices/InvoiceListView";

export default async function InvoiceListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const raw = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") urlParams.set(key, value);
  }
  const query = parseListQuery(urlParams);

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: invoicesQueryKey(query),
    queryFn: () => listInvoices(session, query),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InvoiceListView />
    </HydrationBoundary>
  );
}
