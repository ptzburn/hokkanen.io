import { revalidate } from "@solidjs/router";
import { ResponsiveEditDialog } from "~/components/responsive-edit-dialog.tsx";
import { authClient } from "~/lib/auth-client.ts";

import { viewNumberOfBackupCodesQuery } from "~/queries/auth.ts";
import {
  type Accessor,
  createSignal,
  type JSX,
  Match,
  type Setter,
  Switch,
} from "solid-js";
import { toast } from "solid-sonner";
import { BackupCodesStep } from "./backup-codes-step.tsx";
import { PasswordForm } from "./password-form.tsx";

type RegenerateBackupCodesDialogProps = {
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
};

type Step = "password" | "codes";

export function RegenerateBackupCodesDialog(
  props: RegenerateBackupCodesDialogProps,
): JSX.Element {
  const [step, setStep] = createSignal<Step>("password");
  const [codes, setCodes] = createSignal<string[]>([]);

  async function handlePasswordSubmit(password: string): Promise<void> {
    const { data } = await authClient.twoFactor.generateBackupCodes({
      password,
      fetchOptions: {
        onSuccess: () => {
          revalidate(viewNumberOfBackupCodesQuery.key);
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "Failed to regenerate backup codes",
          );
        },
      },
    });

    if (data && data.backupCodes && data.status) {
      setCodes(data.backupCodes);
      setStep("codes");
    }
  }

  function handleClose(open: boolean): void {
    if (!open) {
      setStep("password");
      setCodes([]);
    }
    props.setIsOpen(open);
  }

  return (
    <ResponsiveEditDialog
      isOpen={props.isOpen}
      setIsOpen={handleClose}
      title={step() === "codes"
        ? "Save your new backup codes"
        : "Regenerate backup codes"}
      description={step() === "codes"
        ? "Your old codes have been replaced. Store these codes in a safe place."
        : "Enter your password to regenerate backup codes. This will invalidate your old codes."}
    >
      {() => (
        <Switch>
          <Match when={step() === "password"}>
            <PasswordForm
              submitLabel="Regenerate"
              onSubmit={handlePasswordSubmit}
            />
          </Match>
          <Match when={step() === "codes"}>
            <BackupCodesStep
              backupCodes={codes()}
              onDone={() => handleClose(false)}
            />
          </Match>
        </Switch>
      )}
    </ResponsiveEditDialog>
  );
}
