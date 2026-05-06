import { useAppForm } from "~/hooks/use-app-form.ts";
import type { JSX } from "solid-js";
import z from "zod";

type PasswordFormProps = {
  submitLabel: string;
  onSubmit: (password: string) => void;
};

export function PasswordForm(props: PasswordFormProps): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: { password: "" },
    validators: {
      onSubmit: z.object({
        password: z.string().min(
          8,
          "Password must be at least 8 characters long",
        ),
      }),
    },
    // deno-lint-ignore require-await
    onSubmit: async ({ value }) => {
      props.onSubmit(value.password);
    },
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      class="space-y-4"
    >
      <form.AppField name="password">
        {(field) => (
          <field.TextField
            label="Password"
            type="password"
            placeholder="Current password"
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>{props.submitLabel}</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
