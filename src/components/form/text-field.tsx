import { Input } from "~/components/ui/input.tsx";

import { useFieldContext } from "~/hooks/use-app-form.ts";
import { type JSX, Show } from "solid-js";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../ui/field.tsx";

export function TextField(
  { label, description, type = "text", placeholder }: {
    label?: string;
    description?: string;
    type?: string;
    placeholder?: string;
  },
): JSX.Element {
  const field = useFieldContext<string | number>();
  const isInvalid = () =>
    field().state.meta.isTouched && !field().state.meta.isValid;

  const handleChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    const value = e.currentTarget.value;
    if (type === "number") {
      // Convert string to number for number inputs
      // Empty string becomes 0, otherwise parse the number
      const numValue = value === "" ? 0 : Number(value);
      // Use type assertion since we know the field expects a number when type="number"
      field().handleChange(numValue as string | number);
    } else {
      field().handleChange(value);
    }
  };

  // Convert number value to string for display in input
  const displayValue = () => {
    const val = field().state.value;
    if (type === "number" && typeof val === "number") {
      return String(val);
    }
    return val ?? "";
  };

  return (
    <Field data-invalid={isInvalid()}>
      <FieldContent>
        <Show when={label}>
          <FieldLabel for={field().name}>{label}</FieldLabel>
        </Show>
        <Show when={description}>
          <FieldDescription>{description}</FieldDescription>
        </Show>
      </FieldContent>
      <Input
        id={field().name}
        name={field().name}
        type={type}
        placeholder={placeholder}
        value={displayValue()}
        onBlur={field().handleBlur}
        onChange={handleChange}
        aria-invalid={isInvalid()}
        disabled={field().form.state.isSubmitting &&
          field().form.state.isValid}
      />
      <Show when={isInvalid()}>
        <FieldError errors={field().state.meta.errors} />
      </Show>
    </Field>
  );
}
