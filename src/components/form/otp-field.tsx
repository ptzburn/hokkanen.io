// deno-lint-ignore-file jsx-key
import { useFieldContext } from "~/hooks/use-app-form.ts";

import { type JSX, Show } from "solid-js";
import { Field, FieldError, FieldLabel } from "../ui/field.tsx";
import {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSlot,
} from "../ui/otp-field.tsx";

export function OTPFieldComponent(
  { label }: {
    label?: string;
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
      <div class="flex justify-center">
        <OTPField
          maxLength={6}
          value={field().state.value ?? ""}
          onValueChange={(value) => {
            const cleaned = value.replace(/\D/g, "").slice(0, 6);
            field().handleChange(cleaned);
          }}
          autofocus
          aria-invalid={isInvalid()}
        >
          <OTPFieldGroup class="gap-2">
            {[0, 1, 2, 3, 4, 5].map((index) => <OTPFieldSlot index={index} />)}
          </OTPFieldGroup>

          <OTPFieldInput
            disabled={false}
          />
        </OTPField>
      </div>
      <Show when={isInvalid()}>
        <FieldError errors={field().state.meta.errors} />
      </Show>
    </Field>
  );
}
