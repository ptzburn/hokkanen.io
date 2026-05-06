import { revalidateLogic } from "@tanstack/solid-form";
import { ResponsiveEditDialog } from "~/components/responsive-edit-dialog.tsx";
import { Button } from "~/components/ui/button.tsx";
import { useAppForm } from "~/hooks/use-app-form.ts";

import { authClient } from "~/lib/auth-client.ts";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";
import z from "zod";

export function ChangePasswordDialog(): JSX.Element {
  const [open, setOpen] = createSignal(false);

  const form = useAppForm(() => ({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z
        .object({
          currentPassword: z.string().min(1),
          newPassword: z.string().min(
            8,
            "Password must be at least 8 characters long",
          ),
          confirmPassword: z.string().min(
            8,
            "Password must be at least 8 characters long",
          ),
        })
        .superRefine((data, ctx) => {
          if (data.newPassword !== data.confirmPassword) {
            ctx.addIssue({
              code: "custom",
              message: "Passwords do not match",
              path: ["newPassword"],
            });
            ctx.addIssue({
              code: "custom",
              message: "Passwords do not match",
              path: ["confirmPassword"],
            });
          }
        }),
    },
    onSubmit: async ({ formApi, value }) => {
      await authClient.changePassword(
        {
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: true,
        },
        {
          onSuccess: () => {
            formApi.reset();
            setOpen(false);
            toast.success("Password changed successfully");
          },
          onError: (error) => {
            toast.error(
              error.error.message || "Failed to change password",
            );
          },
        },
      );
    },
  }));

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        Change password
      </Button>

      <ResponsiveEditDialog
        isOpen={open}
        setIsOpen={setOpen}
        title="Change password"
        description="Update your account password"
      >
        {() => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            class="space-y-4"
          >
            <form.AppField name="currentPassword">
              {(field) => (
                <field.TextField
                  label="Current password"
                  type="password"
                  placeholder="Enter your current password"
                />
              )}
            </form.AppField>
            <form.AppField name="newPassword">
              {(field) => (
                <field.TextField
                  label="New password"
                  type="password"
                  placeholder="Enter your new password"
                />
              )}
            </form.AppField>
            <form.AppField name="confirmPassword">
              {(field) => (
                <field.TextField
                  label="Confirm password"
                  type="password"
                  placeholder="Re-enter your new password"
                />
              )}
            </form.AppField>
            <form.AppForm>
              <form.SubmitButton>Change password</form.SubmitButton>
            </form.AppForm>
          </form>
        )}
      </ResponsiveEditDialog>
    </>
  );
}
