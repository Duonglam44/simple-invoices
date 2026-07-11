import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function InvoiceTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading invoices">
      <div className="bg-card hidden overflow-x-auto rounded-xl border shadow-sm md:block">
        <Table className="min-w-[850px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[4%]">
                <Skeleton className="size-4" />
              </TableHead>
              <TableHead className="w-[14%]">Invoice #</TableHead>
              <TableHead className="w-[12%]">Customer</TableHead>
              <TableHead className="w-[14%]">Description</TableHead>
              <TableHead className="w-[9%]">Issued</TableHead>
              <TableHead className="w-[9%]">Due</TableHead>
              <TableHead className="w-[9%] text-right">Discount</TableHead>
              <TableHead className="w-[10%] text-right">Total</TableHead>
              <TableHead className="w-[11%] text-right">Balance</TableHead>
              <TableHead className="w-[8%]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="size-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1.5 h-3 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3 w-full max-w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-4 w-14" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden p-[1px] md:p-0">
        {Array.from({ length: Math.min(rows, 5) }, (_, index) => (
          <li key={index}>
            <Card className="py-4">
              <CardContent className="px-4">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="mt-2 h-4 w-36" />
                <div className="mt-3 flex items-end justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
