import { Input } from "@/components/ui/input";
import {
  Field,
  type FieldShellProps,
} from "@/components/custom/Field";

export function TextField({
  id,
  label,
  required,
  error,
  className,
  inputClassName,
  ...inputProps
}: FieldShellProps &
  Omit<React.ComponentProps<typeof Input>, "id" | "className"> & {
    inputClassName?: string;
  }) {
  return (
    <Field
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        className={inputClassName}
        {...inputProps}
      />
    </Field>
  );
}
