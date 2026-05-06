import * as AlertDialogPrimitive from "@kobalte/core/alert-dialog";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";

import { buttonVariants } from "~/components/ui/button.tsx";
import { cn } from "~/lib/utils.ts";

import type { JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

type AlertDialogOverlayProps<T extends ValidComponent = "div"> =
  & AlertDialogPrimitive.AlertDialogOverlayProps<T>
  & {
    class?: string | undefined;
  };

const AlertDialogOverlay = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, AlertDialogOverlayProps<T>>,
) => {
  const [local, others] = splitProps(props as AlertDialogOverlayProps, [
    "class",
  ]);
  return (
    <AlertDialogPrimitive.Overlay
      class={cn(
        "data-[closed]:fade-out-0 data-[expanded]:fade-in-0 fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[closed]:animate-out data-[expanded]:animate-in",
        local.class,
      )}
      {...others}
    />
  );
};

type AlertDialogContentProps<T extends ValidComponent = "div"> =
  & AlertDialogPrimitive.AlertDialogContentProps<T>
  & {
    class?: string | undefined;
    children?: JSX.Element;
  };

const AlertDialogContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, AlertDialogContentProps<T>>,
) => {
  const [local, others] = splitProps(props as AlertDialogContentProps, [
    "class",
    "children",
  ]);
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        class={cn(
          "data-[closed]:fade-out-0 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%] data-[closed]:zoom-out-95 data-[expanded]:fade-in-0 data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%] data-[expanded]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full data-[closed]:animate-out data-[expanded]:animate-in",
          local.class,
        )}
        {...others}
      >
        {local.children}
        <AlertDialogPrimitive.CloseButton class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:pointer-events-none data-[expanded]:bg-accent data-[expanded]:text-muted-foreground">
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
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
          </svg>
          <span class="sr-only">Close</span>
        </AlertDialogPrimitive.CloseButton>
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
};

type AlertDialogTitleProps<T extends ValidComponent = "h2"> =
  & AlertDialogPrimitive.AlertDialogTitleProps<T>
  & {
    class?: string | undefined;
  };

const AlertDialogTitle = <T extends ValidComponent = "h2">(
  props: PolymorphicProps<T, AlertDialogTitleProps<T>>,
) => {
  const [local, others] = splitProps(props as AlertDialogTitleProps, ["class"]);
  return (
    <AlertDialogPrimitive.Title
      class={cn("font-semibold text-lg", local.class)}
      {...others}
    />
  );
};

type AlertDialogDescriptionProps<T extends ValidComponent = "p"> =
  & AlertDialogPrimitive.AlertDialogDescriptionProps<T>
  & {
    class?: string | undefined;
  };

const AlertDialogDescription = <T extends ValidComponent = "p">(
  props: PolymorphicProps<T, AlertDialogDescriptionProps<T>>,
) => {
  const [local, others] = splitProps(props as AlertDialogDescriptionProps, [
    "class",
  ]);
  return (
    <AlertDialogPrimitive.Description
      class={cn("text-muted-foreground text-sm", local.class)}
      {...others}
    />
  );
};

type AlertDialogHeaderProps<T extends ValidComponent = "div"> = {
  class?: string | undefined;
  children?: JSX.Element;
};

const AlertDialogHeader = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, AlertDialogHeaderProps<T>>,
) => {
  const [local, others] = splitProps(props as AlertDialogHeaderProps, [
    "class",
    "children",
  ]);
  return (
    <div
      class={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </div>
  );
};

type AlertDialogFooterProps<T extends ValidComponent = "div"> = {
  class?: string | undefined;
  children?: JSX.Element;
};

const AlertDialogFooter = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, AlertDialogFooterProps<T>>,
) => {
  const [local, others] = splitProps(props as AlertDialogFooterProps, [
    "class",
    "children",
  ]);
  return (
    <div
      class={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        local.class,
      )}
      {...others}
    >
      {local.children}
    </div>
  );
};

type AlertDialogActionProps<T extends ValidComponent = "button"> = {
  class?: string | undefined;
  children?: JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
};

const AlertDialogAction = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, AlertDialogActionProps<T>>,
) => {
  const [local, others] = splitProps(props as AlertDialogActionProps, [
    "class",
    "children",
    "onClick",
  ]);
  return (
    <AlertDialogPrimitive.CloseButton
      class={cn(buttonVariants(), local.class)}
      onClick={local.onClick}
      {...others}
    >
      {local.children}
    </AlertDialogPrimitive.CloseButton>
  );
};

type AlertDialogCancelProps<T extends ValidComponent = "button"> = {
  class?: string | undefined;
  children?: JSX.Element;
};

const AlertDialogCancel = <T extends ValidComponent = "button">(
  props: PolymorphicProps<T, AlertDialogCancelProps<T>>,
) => {
  const [local, others] = splitProps(props as AlertDialogCancelProps, [
    "class",
    "children",
  ]);
  return (
    <AlertDialogPrimitive.CloseButton
      class={cn(buttonVariants({ variant: "outline" }), local.class)}
      {...others}
    >
      {local.children}
    </AlertDialogPrimitive.CloseButton>
  );
};

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
