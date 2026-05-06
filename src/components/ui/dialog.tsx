import * as DialogPrimitive from "@kobalte/core/dialog";
import type { PolymorphicProps } from "@kobalte/core/polymorphic";

import { cn } from "~/lib/utils.ts";
import XIcon from "~icons/lucide/x";

import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js";
import { splitProps } from "solid-js";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal: Component<DialogPrimitive.DialogPortalProps> = (props) => {
  const [, rest] = splitProps(props, ["children"]);
  return (
    <DialogPrimitive.Portal {...rest}>
      <div class="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
        {props.children}
      </div>
    </DialogPrimitive.Portal>
  );
};

type DialogOverlayProps<T extends ValidComponent = "div"> =
  & DialogPrimitive.DialogOverlayProps<T>
  & { class?: string | undefined };

const DialogOverlay = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, DialogOverlayProps<T>>,
) => {
  const [, rest] = splitProps(props as DialogOverlayProps, ["class"]);
  return (
    <DialogPrimitive.Overlay
      class={cn(
        "data-[closed]:fade-out-0 data-[expanded]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[closed]:animate-out data-[expanded]:animate-in",
        props.class,
      )}
      {...rest}
    />
  );
};

type DialogContentProps<T extends ValidComponent = "div"> =
  & DialogPrimitive.DialogContentProps<T>
  & {
    class?: string | undefined;
    children?: JSX.Element;
  };

const DialogContent = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, DialogContentProps<T>>,
) => {
  const [, rest] = splitProps(props as DialogContentProps, [
    "class",
    "children",
  ]);
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        class={cn(
          "data-[closed]:fade-out-0 data-[closed]:slide-out-to-left-1/2 data-[closed]:slide-out-to-top-[48%] data-[closed]:zoom-out-95 data-[expanded]:fade-in-0 data-[expanded]:slide-in-from-left-1/2 data-[expanded]:slide-in-from-top-[48%] data-[expanded]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid max-h-screen w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto border bg-background p-6 shadow-lg duration-200 sm:rounded-lg data-[closed]:animate-out data-[expanded]:animate-in",
          props.class,
        )}
        {...rest}
      >
        {props.children}
        <DialogPrimitive.CloseButton class="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:cursor-pointer hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:pointer-events-none data-[expanded]:bg-accent data-[expanded]:text-muted-foreground">
          <XIcon />
          <span class="sr-only">Close</span>
        </DialogPrimitive.CloseButton>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
};

const DialogHeader: Component<ComponentProps<"div">> = (props) => {
  const [, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        props.class,
      )}
      {...rest}
    />
  );
};

const DialogFooter: Component<ComponentProps<"div">> = (props) => {
  const [, rest] = splitProps(props, ["class"]);
  return (
    <div
      class={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        props.class,
      )}
      {...rest}
    />
  );
};

type DialogTitleProps<T extends ValidComponent = "h2"> =
  & DialogPrimitive.DialogTitleProps<T>
  & {
    class?: string | undefined;
  };

const DialogTitle = <T extends ValidComponent = "h2">(
  props: PolymorphicProps<T, DialogTitleProps<T>>,
) => {
  const [, rest] = splitProps(props as DialogTitleProps, ["class"]);
  return (
    <DialogPrimitive.Title
      class={cn(
        "font-semibold text-lg leading-none",
        props.class,
      )}
      {...rest}
    />
  );
};

type DialogDescriptionProps<T extends ValidComponent = "p"> =
  & DialogPrimitive.DialogDescriptionProps<T>
  & {
    class?: string | undefined;
  };

const DialogDescription = <T extends ValidComponent = "p">(
  props: PolymorphicProps<T, DialogDescriptionProps<T>>,
) => {
  const [, rest] = splitProps(props as DialogDescriptionProps, ["class"]);
  return (
    <DialogPrimitive.Description
      class={cn("text-muted-foreground text-sm", props.class)}
      {...rest}
    />
  );
};

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
