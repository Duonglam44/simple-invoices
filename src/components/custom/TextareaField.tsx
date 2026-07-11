import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  type FieldShellProps,
} from "@/components/custom/Field";

export function TextareaField({
  id,
  label,
  required,
  error,
  className,
  ...textareaProps
}: FieldShellProps &
  Omit<React.ComponentProps<typeof Textarea>, "id" | "className">) {
  return (
    <Field
      id={id}
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <Textarea id={id} aria-invalid={Boolean(error)} {...textareaProps} />
    </Field>
  );
}
