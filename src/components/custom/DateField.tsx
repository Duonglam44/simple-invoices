import { DatePicker } from "@/components/ui/date-picker";
import {
  Field,
  type FieldShellProps,
} from "@/components/custom/Field";

export function DateField({
  id,
  label,
  required,
  error,
  className,
  ...pickerProps
}: FieldShellProps &
  Omit<React.ComponentProps<typeof DatePicker>, "id" | "aria-invalid">) {
  return (
    <Field
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <DatePicker id={id} aria-invalid={Boolean(error)} {...pickerProps} />
    </Field>
  );
}
