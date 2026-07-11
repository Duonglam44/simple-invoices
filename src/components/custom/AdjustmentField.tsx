import { EXTENSION_TYPES } from "@/constants/invoice";
import { EXTENSION_TYPE_LABELS } from "@/lib/invoice-totals";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field } from "@/components/custom/Field";

export function AdjustmentField({
  id,
  label,
  type,
  onTypeChange,
  error,
  valueProps,
}: {
  id: string;
  label: string;
  type: (typeof EXTENSION_TYPES)[number];
  onTypeChange: (value: (typeof EXTENSION_TYPES)[number]) => void;
  error?: string;
  valueProps: React.ComponentProps<typeof Input>;
}) {
  return (
    <Field id={id} label={label} error={error}>
      <div className="flex gap-2">
        <Input
          id={id}
          type="number"
          min="0"
          step="any"
          aria-invalid={Boolean(error)}
          {...valueProps}
        />
        <Select
          value={type}
          onValueChange={(value) => onTypeChange(value as typeof type)}
        >
          <SelectTrigger className="w-16 shrink-0" aria-label={`${label} type`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXTENSION_TYPES.map((extType) => (
              <SelectItem key={extType} value={extType}>
                {EXTENSION_TYPE_LABELS[extType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Field>
  );
}
