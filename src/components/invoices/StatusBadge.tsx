import { Badge } from "@/components/ui/badge";

const STYLES: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Due: "bg-amber-50 text-amber-700 border-amber-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={STYLES[status] ?? "text-muted-foreground"}
    >
      {status}
    </Badge>
  );
}
