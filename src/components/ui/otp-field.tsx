import type { DynamicProps, RootProps } from "@corvu/otp-field";
import OtpField from "@corvu/otp-field";

import { cn } from "~/lib/utils.ts";
import type { Component, ComponentProps, ValidComponent } from "solid-js";

import { Show, splitProps } from "solid-js";

export const REGEXP_ONLY_DIGITS = "^\\d*$";
export const REGEXP_ONLY_CHARS = "^[a-zA-Z]*$";
export const REGEXP_ONLY_DIGITS_AND_CHARS = "^[a-zA-Z0-9]*$";

type OTPFieldProps<T extends ValidComponent = "div"> = RootProps<T> & {
  class?: string;
};

const OTPField = <T extends ValidComponent = "div">(
  props: DynamicProps<T, OTPFieldProps<T>>,
) => {
  const [local, others] = splitProps(props as OTPFieldProps, ["class"]);
  return (
    <OtpField
      class={cn(
        "flex items-center gap-2 disabled:cursor-not-allowed has-disabled:opacity-50",
        local.class,
      )}
      {...others}
    />
  );
};

const OTPFieldInput = OtpField.Input;

const OTPFieldGroup: Component<ComponentProps<"div">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return <div class={cn("flex items-center", local.class)} {...others} />;
};

const OTPFieldSlot: Component<ComponentProps<"div"> & { index: number }> = (
  props,
) => {
  const [local, others] = splitProps(props, ["class", "index"]);
  const context = OtpField.useContext();
  const char = () => context.value()[local.index];
  const showFakeCaret = () =>
    context.value().length === local.index && context.isInserting();
  const isActive = () => context.activeSlots().includes(local.index);

  return (
    <div
      data-active={isActive()}
      class={cn(
        "relative flex h-9 w-9 items-center justify-center border-input border-r border-y text-sm shadow-xs outline-none transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        "data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:ring-[3px]",
        "dark:bg-input/30",
        local.class,
      )}
      {...others}
    >
      {char()}
      <Show when={showFakeCaret()}>
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div class="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      </Show>
    </div>
  );
};

const OTPFieldSeparator: Component<ComponentProps<"div">> = (props) => {
  return (
    <div role="separator" {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-4"
      >
        <path d="M5 12h14" />
      </svg>
    </div>
  );
};

export {
  OTPField,
  OTPFieldGroup,
  OTPFieldInput,
  OTPFieldSeparator,
  OTPFieldSlot,
};
