import { Button } from "~/components/ui/button.tsx";
import { useFormContext } from "~/hooks/use-app-form.ts";

import { cn } from "~/lib/utils.ts";
import type { ComponentProps, JSX } from "solid-js";
import { splitProps } from "solid-js";
import { Spinner } from "../ui/spinner.tsx";

type SubmitButtonProps = {
  loadingText?: JSX.Element;
  fullWidth?: boolean;
} & Omit<ComponentProps<typeof Button>, "type">;

export function SubmitButton(props: SubmitButtonProps): JSX.Element {
  const [local, buttonProps] = splitProps(props, [
    "children",
    "loadingText",
    "fullWidth",
    "disabled",
    "class",
  ]);

  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        canSubmit: state.canSubmit,
      })}
    >
      {(state) => (
        <Button
          type="submit"
          class={cn(
            (local.fullWidth ?? true) ? "w-full" : "",
            local.class,
          )}
          disabled={!state().canSubmit || (local.disabled ?? false)}
          {...buttonProps}
        >
          {state().isSubmitting
            ? (local.loadingText ?? <Spinner />)
            : (local.children ?? "Submit")}
        </Button>
      )}
    </form.Subscribe>
  );
}
