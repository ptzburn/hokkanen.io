import { Textarea } from "~/components/ui/textarea.tsx";

import { useFieldContext } from "~/hooks/use-app-form.ts";
import { type JSX, Show } from "solid-js";
import { Field, FieldError, FieldLabel } from "../ui/field.tsx";

export function TextareaField(
  { label, placeholder, rows }: {
    label?: string;
    placeholder?: string;
    rows?: number;
  },
): JSX.Element {
  const field = useFieldContext<string>();
  const isInvalid = () =>
    field().state.meta.isTouched && !field().state.meta.isValid;

  return (
    <Field data-invalid={isInvalid()}>
      <Show when={label}>
        <FieldLabel
          for={field().name}
        >
          {label}
        </FieldLabel>
      </Show>
      <Textarea
        id={field().name}
        name={field().name}
        placeholder={placeholder}
        rows={rows}
        value={field().state.value}
        onBlur={field().handleBlur}
        onChange={(e: Event & { currentTarget: HTMLTextAreaElement }) =>
          field().handleChange(e.currentTarget.value)}
        aria-invalid={isInvalid()}
        class="min-h-[120px]"
      />
      <Show when={isInvalid()}>
        <FieldError errors={field().state.meta.errors} />
      </Show>
    </Field>
  );
}
