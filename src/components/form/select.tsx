import { isFieldInvalid, useFieldContext } from "~/hooks/use-app-form.ts";

import { type JSX, Show } from "solid-js";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../ui/field.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.tsx";

type SelectOption<T = string | number> = {
  value: T;
  label: string;
};

export function SelectField<T extends string | number = string | number>(
  { label, description, placeholder, options }: {
    label?: string;
    description?: string;
    placeholder?: string;
    options: T[] | SelectOption<T>[];
  },
): JSX.Element {
  const field = useFieldContext<T>();

  // Check if options are objects with value/label or primitives
  const isObjectOptions = options.length > 0 &&
    typeof options[0] === "object" &&
    "value" in options[0];

  // Transform options to the format Select expects
  const selectOptions = isObjectOptions
    ? (options as SelectOption<T>[]).map((opt) => opt.value)
    : options as T[];

  // Get display label for a value
  const getLabel = (value: T) => {
    if (isObjectOptions) {
      const option = (options as SelectOption<T>[]).find((opt) =>
        opt.value === value
      );
      return option?.label ?? value;
    }
    return value;
  };

  return (
    <Field orientation="vertical" data-invalid={isFieldInvalid(field)}>
      <FieldContent>
        <Show when={label}>
          <FieldLabel
            for={field().name}
          >
            {label}
          </FieldLabel>
        </Show>
        <Show when={description}>
          <FieldDescription>
            {description}
          </FieldDescription>
        </Show>
      </FieldContent>
      <Select
        value={field().state.value ?? null}
        onChange={(value) => value && field().handleChange(value)}
        options={selectOptions}
        disabled={field().form.state.isSubmitting && field().form.state.isValid}
        placeholder={placeholder ?? "Valitse"}
        itemComponent={(props) => (
          <SelectItem item={props.item}>
            {getLabel(props.item.rawValue)}
          </SelectItem>
        )}
      >
        <SelectTrigger
          id={field().name}
          aria-invalid={isFieldInvalid(field)}
          class="min-w-[10px]"
        >
          <SelectValue<T>>
            {(state) => getLabel(state.selectedOption())}
          </SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
      <Show when={isFieldInvalid(field)}>
        <FieldError errors={field().state.meta.errors} />
      </Show>
    </Field>
  );
}
