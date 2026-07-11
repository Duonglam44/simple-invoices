import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/login/FieldError";
import { RequiredMark } from "@/components/invoices/CreateInvoice/FormSection";

export interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function Field({
  id,
  label,
  required = false,
  error,
  className,
  children,
}: FieldShellProps & { children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <RequiredMark />}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
