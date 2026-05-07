import { revalidate } from "@solidjs/router";
import { revalidateLogic } from "@tanstack/solid-form";
import { ResponsiveEditDialog } from "~/components/responsive-edit-dialog.tsx";
import { Button } from "~/components/ui/button.tsx";
import { submitForm, useAppForm } from "~/hooks/use-app-form.ts";
import { authClient } from "~/lib/auth-client.ts";
import { getSessionQuery } from "~/queries/auth.ts";
import { createSignal, type JSX } from "solid-js";
import { toast } from "solid-sonner";
import { z } from "zod";

type NameEditDialogProps = {
  currentName: string;
};

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const [firstName = "", ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(" "),
  };
}

export function NameEditDialog(props: NameEditDialogProps): JSX.Element {
  const [open, setOpen] = createSignal(false);

  const form = useAppForm(() => ({
    defaultValues: splitName(props.currentName),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: z.object({
        firstName: z.string().trim().min(1),
        lastName: z.string().trim().min(1),
      }),
    },
    onSubmit: async ({ formApi, value }) => {
      const fullName = [value.firstName.trim(), value.lastName.trim()]
        .filter(Boolean)
        .join(" ");

      await authClient.updateUser(
        {
          name: fullName,
        },
        {
          onSuccess: () => {
            formApi.reset();
            setOpen(false);
            revalidate(getSessionQuery.key);
            toast.success("Name updated");
          },
          onError: (error) => {
            toast.error(error.error.message || "Failed to update name");
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
        Edit name
      </Button>

      <ResponsiveEditDialog
        isOpen={open}
        setIsOpen={setOpen}
        title="Edit name"
      >
        {() => (
          <form onSubmit={submitForm(form)} class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <form.AppField name="firstName">
                {(field) => (
                  <field.TextField
                    label="First name"
                    placeholder="First name"
                  />
                )}
              </form.AppField>
              <form.AppField name="lastName">
                {(field) => (
                  <field.TextField
                    label="Last name"
                    placeholder="Last name"
                  />
                )}
              </form.AppField>
            </div>
            <form.AppForm>
              <form.SubmitButton>Save</form.SubmitButton>
            </form.AppForm>
          </form>
        )}
      </ResponsiveEditDialog>
    </>
  );
}
