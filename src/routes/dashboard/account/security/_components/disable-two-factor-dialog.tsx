import { revalidate } from "@solidjs/router";
import { ResponsiveEditDialog } from "~/components/responsive-edit-dialog.tsx";
import { authClient } from "~/lib/auth-client.ts";

import { getSessionQuery } from "~/queries/auth.ts";
import type { Accessor, JSX, Setter } from "solid-js";
import { toast } from "solid-sonner";
import { PasswordForm } from "./password-form.tsx";

type DisableTwoFactorDialogProps = {
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
};

export function DisableTwoFactorDialog(
  props: DisableTwoFactorDialogProps,
): JSX.Element {
  async function handlePasswordSubmit(password: string): Promise<void> {
    await authClient.twoFactor.disable({
      password,
      fetchOptions: {
        onSuccess: () => {
          props.setIsOpen(false);
          revalidate(getSessionQuery.key);
          toast.success("Two-factor authentication disabled");
        },
        onError: (ctx) => {
          toast.error(
            ctx.error.message || "Failed to disable two-factor authentication",
          );
        },
      },
    });
  }

  return (
    <ResponsiveEditDialog
      isOpen={props.isOpen}
      setIsOpen={props.setIsOpen}
      title="Disable two-factor authentication"
      description="Enter your password to disable two-factor authentication"
    >
      {() => (
        <PasswordForm
          submitLabel="Disable"
          onSubmit={handlePasswordSubmit}
        />
      )}
    </ResponsiveEditDialog>
  );
}
