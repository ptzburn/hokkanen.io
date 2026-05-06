import { Button } from "~/components/ui/button.tsx";

import { useAppForm } from "~/hooks/use-app-form.ts";
import { authClient } from "~/lib/auth-client.ts";
import { createSignal, type JSX, Match, Show, Switch } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

type TwoFactorVerificationProps = {
  onBack?: () => void;
};

type TwoFactorMethod = "totp" | "backup";

function TotpForm(props: {
  onUseBackup: () => void;
  onBack?: () => void;
}): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: { code: "" },
    validators: {
      onSubmit: z.object({
        code: z.string().length(6, "Invalid code"),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyTotp({
        code: value.code,
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message || "An error occurred");
          },
          onSuccess: () => {
            globalThis.location.href = "/dashboard";
          },
        },
      });
    },
  }));

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Two-Factor Authentication</h1>
        <p class="text-balance text-muted-foreground text-sm">
          Enter the 6-digit code from your authenticator app.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        class="grid gap-6"
      >
        <form.AppField name="code">
          {(field) => <field.OTPField />}
        </form.AppField>
        <Button
          variant="link"
          class="h-auto p-0 text-sm"
          type="button"
          onClick={props.onUseBackup}
        >
          Use Backup Code
        </Button>
        <form.AppForm>
          <form.SubmitButton>Verify</form.SubmitButton>
        </form.AppForm>
        <div class="flex flex-col gap-3">
          <Show when={props.onBack}>
            <Button
              variant="outline"
              class="w-full"
              type="button"
              onClick={() => props.onBack?.()}
              disabled={form.state.isSubmitting}
            >
              Back
            </Button>
          </Show>
        </div>
      </form>
    </div>
  );
}

function BackupCodeForm(props: {
  onUseTotp: () => void;
  onBack?: () => void;
}): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: { code: "" },
    validators: {
      onSubmit: z.object({
        code: z.string().min(1, "Invalid code"),
      }),
    },
    onSubmit: async ({ value }) => {
      await authClient.twoFactor.verifyBackupCode({
        code: value.code,
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message || "An error occurred");
          },
          onSuccess: () => {
            globalThis.location.href = "/dashboard";
          },
        },
      });
    },
  }));

  return (
    <div class="space-y-8">
      <div class="flex flex-col items-center gap-2 text-center">
        <h1 class="font-bold text-2xl">Two-Factor Authentication</h1>
        <p class="text-balance text-muted-foreground text-sm">
          Enter one of the backup codes you saved when setting up two-factor
          authentication.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        class="grid gap-6"
      >
        <form.AppField name="code">
          {(field) => (
            <field.TextField
              label="Backup Code"
              placeholder="Enter your backup code"
            />
          )}
        </form.AppField>
        <Button
          variant="link"
          class="h-auto p-0 text-sm"
          type="button"
          onClick={props.onUseTotp}
        >
          Use TOTP
        </Button>
        <form.AppForm>
          <form.SubmitButton>Verify</form.SubmitButton>
        </form.AppForm>
        <div class="flex flex-col gap-3">
          <Show when={props.onBack}>
            <Button
              variant="outline"
              class="w-full"
              type="button"
              onClick={() => props.onBack?.()}
              disabled={form.state.isSubmitting}
            >
              Back
            </Button>
          </Show>
        </div>
      </form>
    </div>
  );
}

export function TwoFactorVerification(
  props: TwoFactorVerificationProps,
): JSX.Element {
  const [method, setMethod] = createSignal<TwoFactorMethod>("totp");

  return (
    <Switch>
      <Match when={method() === "totp"}>
        <TotpForm
          onUseBackup={() => setMethod("backup")}
          onBack={props.onBack}
        />
      </Match>
      <Match when={method() === "backup"}>
        <BackupCodeForm
          onUseTotp={() => setMethod("totp")}
          onBack={props.onBack}
        />
      </Match>
    </Switch>
  );
}
