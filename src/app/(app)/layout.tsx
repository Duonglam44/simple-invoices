import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { UserStoreHydrator } from "@/components/UserStoreHydrator";
import { UserMenu } from "@/components/nav/UserMenu";
import { NavLinks } from "@/components/nav/NavLinks";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-dvh flex-col max-md:h-dvh print:h-auto">
      <UserStoreHydrator user={user} />
      <header className="bg-background/90 sticky top-0 z-20 border-b backdrop-blur print:hidden">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Simple<span className="text-primary">Invoice</span>
            </Link>
            <NavLinks />
          </div>
          <UserMenu />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-3 md:py-6 sm:px-6 sm:py-8 max-md:min-h-0 max-md:overflow-y-auto print:h-auto print:max-w-none print:overflow-visible print:p-0">
        {children}
      </main>
      <footer className="text-muted-foreground border-t py-4 text-center text-xs print:hidden">
        SimpleInvoice — 101 Digital Web Engineer Assessment
      </footer>
      <CreateInvoiceDialog />
    </div>
  );
}
