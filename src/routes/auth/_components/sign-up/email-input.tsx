import { A } from "@solidjs/router";
import { useAppForm } from "~/hooks/use-app-form.ts";
import type { Step } from "~/routes/auth/sign-up.tsx";
import type { JSX, Setter } from "solid-js";
import z from "zod";

type EmailInputProps = {
  setStep: Setter<Step>;
  setEmail: Setter<string>;
};

export function EmailInput(props: EmailInputProps): JSX.Element {
  const emailForm = useAppForm(() => ({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: z.object({
        email: z.email(),
      }),
    },
    onSubmit: ({ value }) => {
      props.setEmail(value.email);
      props.setStep("registration");
    },
  }));

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Sign Up</h1>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          emailForm.handleSubmit();
        }}
        class="space-y-8"
      >
        <div class="grid gap-6">
          <emailForm.AppField name="email">
            {(field) => (
              <field.TextField
                type="email"
                label="Email"
                placeholder="johndoe@example.com"
              />
            )}
          </emailForm.AppField>
          <emailForm.AppForm>
            <emailForm.SubmitButton>
              Continue
            </emailForm.SubmitButton>
          </emailForm.AppForm>
        </div>
      </form>
      <div class="text-center text-sm">
        Already have an account?{" "}
        <A
          href="/auth/sign-in"
          class="underline underline-offset-4"
        >
          Sign in
        </A>
      </div>
    </div>
  );
}
