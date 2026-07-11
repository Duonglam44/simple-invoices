import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  type FieldShellProps,
} from "@/components/custom/Field";

export function SelectField({
  id,
  label,
  required,
  error,
  className,
  value,
  onValueChange,
  options,
}: FieldShellProps & {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <Field
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} aria-invalid={Boolean(error)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
