import { Turnstile } from "@nerimity/solid-turnstile";
import { Badge } from "~/components/ui/badge.tsx";
import { Button } from "~/components/ui/button.tsx";
import { useAppForm } from "~/hooks/use-app-form.ts";
import { authClient } from "~/lib/auth-client.ts";
import { capitalize } from "~/lib/utils.ts";
import type { Step } from "~/routes/auth/sign-up.tsx";
import Mail from "~icons/lucide/mail";
import { type Accessor, createSignal, type JSX, type Setter } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

type RegistrationProps = {
  email: Accessor<string>;
  setStep: Setter<Step>;
};

export function Registration(props: RegistrationProps): JSX.Element {
  const [turnstileToken, setTurnstileToken] = createSignal<string>();

  const registrationFormSchema = z
    .object({
      firstName: z.string()
        .min(2),
      lastName: z.string()
        .min(2),
      password: z.string().min(8),
      confirmPassword: z.string().min(8),
    }).superRefine((data, context) => {
      if (data.password !== data.confirmPassword) {
        context.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["password"],
        });
        context.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    });

  const registrationForm = useAppForm(() => ({
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: registrationFormSchema,
    },
    onSubmit: async ({ value }) => {
      const fullName = `${capitalize(value.firstName)} ${
        capitalize(value.lastName)
      }`.trim();

      await authClient.signUp.email({
        email: props.email(),
        password: value.password,
        name: fullName,
        fetchOptions: {
          headers: {
            "x-captcha-response": turnstileToken() ?? "",
          },
          onSuccess: () => {
            globalThis.location.href = "/dashboard";
          },
          onError: (error) => {
            toast.error(
              error.error.message || "An error occurred",
            );
          },
        },
      });
    },
  }));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        registrationForm.handleSubmit();
      }}
      class="space-y-8"
    >
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">
          Register
        </h1>
        <Badge
          variant="secondary"
          class="flex items-center gap-2"
        >
          <Mail class="size-4" />
          {props.email()}
        </Badge>
      </div>
      <div class="grid gap-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <registrationForm.AppField name="firstName">
            {(field) => (
              <field.TextField
                type="text"
                placeholder="First name"
              />
            )}
          </registrationForm.AppField>

          <registrationForm.AppField name="lastName">
            {(field) => (
              <field.TextField
                type="text"
                placeholder="Last name"
              />
            )}
          </registrationForm.AppField>
        </div>

        <registrationForm.AppField name="password">
          {(field) => (
            <field.TextField
              type="password"
              placeholder="Password"
            />
          )}
        </registrationForm.AppField>
        <registrationForm.AppField name="confirmPassword">
          {(field) => (
            <field.TextField
              type="password"
              placeholder="Confirm password"
            />
          )}
        </registrationForm.AppField>
        <div class="flex justify-center">
          <Turnstile
            sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
            onVerify={setTurnstileToken}
            autoResetOnExpire
          />
        </div>
        <registrationForm.AppForm>
          <registrationForm.SubmitButton disabled={!turnstileToken()}>
            Create account
          </registrationForm.SubmitButton>
        </registrationForm.AppForm>
        <Button
          variant="outline"
          class="w-full"
          type="button"
          onClick={() => {
            props.setStep("email");
          }}
          disabled={registrationForm.state.isSubmitting}
        >
          Back
        </Button>
      </div>
    </form>
  );
}
