import { A, useLocation, useNavigate } from "@solidjs/router";
import { useAppForm } from "~/hooks/use-app-form.ts";

import { authClient } from "~/lib/auth-client.ts";
import { createSignal, type JSX, Match, Switch } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

function ResetPasswordPage(): JSX.Element {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = createSignal(false);

  const form = useAppForm(() => ({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: z.object({
        password: z.string().min(
          8,
          "Password must be at least 8 characters long",
        ),
        confirmPassword: z.string().min(
          8,
          "Password must be at least 8 characters long",
        ),
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
      }),
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Invalid link");
        return;
      }

      const { password } = value;
      await authClient.resetPassword({
        newPassword: password,
        token,
        fetchOptions: {
          onError: (error) => {
            toast.error(
              error.error.message ||
                "An error occurred",
            );
          },
          onSuccess: () => {
            setIsSuccess(true);
            toast.success("Password reset successfully");
          },
        },
      });
      navigate("/auth/sign-in");
    },
  }));

  return (
    <Switch
      fallback={
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          class="space-y-8"
        >
          <div class="flex flex-col items-center gap-2 text-center">
            <h1 class="font-bold text-2xl">Reset Password</h1>
            <p class="text-balance text-muted-foreground text-sm">
              Enter your new password below.
            </p>
          </div>
          <div class="grid gap-6">
            <form.AppField name="password">
              {(field) => (
                <field.TextField
                  label="New Password"
                  type="password"
                  placeholder="Enter your new password"
                />
              )}
            </form.AppField>
            <form.AppField name="confirmPassword">
              {(field) => (
                <field.TextField
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your new password"
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton>
                Reset Password
              </form.SubmitButton>
            </form.AppForm>
          </div>
          <div class="text-center text-sm">
            Remember your password?{" "}
            <A
              href="/auth/sign-in"
              class="underline underline-offset-4"
            >
              Sign In
            </A>
          </div>
        </form>
      }
    >
      <Match when={!token}>
        <div class="space-y-6">
          <div class="flex flex-col items-center gap-2 text-center">
            <h1 class="font-bold text-2xl">
              Invalid Link
            </h1>
            <p class="text-balance text-muted-foreground text-sm">
              The link is invalid or has expired.
            </p>
          </div>
          <div class="text-center">
            <A
              href="/auth/forgot-password"
              class="text-sm underline underline-offset-4"
            >
              Request a new link
            </A>
          </div>
        </div>
      </Match>
      <Match when={isSuccess()}>
        <div class="space-y-6">
          <div class="flex flex-col items-center gap-2 text-center">
            <h1 class="font-bold text-2xl">
              Password Reset Successfully
            </h1>
            <p class="text-balance text-muted-foreground text-sm">
              Your password has been reset successfully.
            </p>
          </div>
        </div>
      </Match>
    </Switch>
  );
}

export default ResetPasswordPage;
