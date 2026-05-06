import { useAppForm } from "~/hooks/use-app-form.ts";
import { type JSX, Show } from "solid-js";
import { QRCodeSVG } from "solid-qr-code";

import { z } from "zod";

type VerifyTotpStepProps = {
  totpUri: string;
  onSubmit: (code: string) => void;
};

export function VerifyTotpStep(props: VerifyTotpStepProps): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: { code: "" },
    validators: {
      onSubmit: z.object({
        code: z.string().length(6, "Enter a 6-digit code"),
      }),
    },
    // deno-lint-ignore require-await
    onSubmit: async ({ value }) => {
      props.onSubmit(value.code);
    },
  }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      class="space-y-6"
    >
      <Show when={props.totpUri}>
        <div class="flex justify-center">
          <div class="rounded-lg bg-white p-3">
            <QRCodeSVG
              value={props.totpUri}
              width={200}
              height={200}
              level="medium"
              backgroundColor="#ffffff"
              backgroundAlpha={1}
              foregroundColor="#000000"
              foregroundAlpha={1}
            />
          </div>
        </div>
      </Show>

      <form.AppField name="code">
        {(field) => <field.OTPField label="Verification code" />}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton>Verify</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
