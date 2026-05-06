import type { PolymorphicProps } from "@kobalte/core/polymorphic";
import * as TextFieldPrimitive from "@kobalte/core/text-field";

import { Button, type ButtonProps } from "~/components/ui/button.tsx";
import { cn } from "~/lib/utils.ts";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import type { Component, ComponentProps, JSX, ValidComponent } from "solid-js";
import { mergeProps, splitProps } from "solid-js";

type InputGroupProps<T extends ValidComponent = "div"> =
  & TextFieldPrimitive.TextFieldRootProps<T>
  & { class?: string | undefined };

const InputGroup = <T extends ValidComponent = "div">(
  props: PolymorphicProps<T, InputGroupProps<T>>,
) => {
  const [local, others] = splitProps(props as InputGroupProps, ["class"]);
  return (
    <TextFieldPrimitive.Root
      data-slot="input-group"
      class={cn(
        "group/input-group relative flex w-full items-center rounded-md border border-input shadow-xs outline-none transition-[color,box-shadow] dark:bg-input/30",
        "h-9 min-w-0 has-[>textarea]:h-auto",
        // Variants based on alignment.
        "has-[>[data-align=inline-start]]:[&>input]:pl-2",
        "has-[>[data-align=inline-end]]:[&>input]:pr-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3",
        // Focus state.
        "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50 has-[[data-slot=input-group-control]:focus-visible]:ring-[3px]",
        // Error state.
        "dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 has-[[data-slot][aria-invalid=true]]:border-error-foreground has-[[data-slot][aria-invalid=true]]:text-error-foreground has-[[data-slot][aria-invalid=true]]:ring-destructive/20",
        local.class,
      )}
      {...others}
    />
  );
};

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        "inline-start":
          "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
        "inline-end":
          "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
        "block-start":
          "order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
        "block-end":
          "order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

type InputGroupAddonProps =
  & ComponentProps<"div">
  & VariantProps<typeof inputGroupAddonVariants>;

const InputGroupAddon: Component<InputGroupAddonProps> = (rawProps) => {
  const props = mergeProps({ align: "inline-start" as const }, rawProps);
  const [local, others] = splitProps(props, ["class", "align"]);

  const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    e.currentTarget.parentElement?.querySelector("input")?.focus();
  };

  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={local.align}
      class={cn(inputGroupAddonVariants({ align: local.align }), local.class)}
      onClick={handleClick}
      {...others}
    />
  );
};

const inputGroupButtonVariants = cva(
  "text-sm shadow-none flex gap-2 items-center",
  {
    variants: {
      size: {
        xs:
          "h-6 gap-1 px-2 rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
        sm: "h-8 px-2.5 gap-1.5 rounded-md has-[>svg]:px-2.5",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

type InputGroupButtonProps =
  & Omit<ButtonProps, "size">
  & VariantProps<typeof inputGroupButtonVariants>;

const InputGroupButton: Component<InputGroupButtonProps> = (rawProps) => {
  const props = mergeProps(
    { type: "button" as const, variant: "ghost" as const, size: "xs" as const },
    rawProps,
  );
  const [local, others] = splitProps(props, ["class", "size", "variant"]);
  return (
    <Button
      data-size={local.size}
      variant={local.variant}
      class={cn(inputGroupButtonVariants({ size: local.size }), local.class)}
      {...others}
    />
  );
};

const InputGroupText: Component<ComponentProps<"span">> = (props) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <span
      class={cn(
        "flex items-center gap-2 text-muted-foreground text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        local.class,
      )}
      {...others}
    />
  );
};

type InputGroupInputProps<T extends ValidComponent = "input"> =
  & TextFieldPrimitive.TextFieldInputProps<T>
  & { class?: string | undefined };

const InputGroupInput = <T extends ValidComponent = "input">(
  props: PolymorphicProps<T, InputGroupInputProps<T>>,
) => {
  const [local, others] = splitProps(props as InputGroupInputProps, ["class"]);
  return (
    <TextFieldPrimitive.Input
      data-slot="input-group-control"
      class={cn(
        "h-full flex-1 rounded-none border-0 bg-transparent px-3 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent",
        local.class,
      )}
      {...others}
    />
  );
};

type InputGroupTextareaProps<T extends ValidComponent = "textarea"> =
  & TextFieldPrimitive.TextFieldTextAreaProps<T>
  & { class?: string | undefined; autoResize?: boolean };

const InputGroupTextarea = <T extends ValidComponent = "textarea">(
  props: PolymorphicProps<T, InputGroupTextareaProps<T>>,
) => {
  const [local, others] = splitProps(props as InputGroupTextareaProps, [
    "class",
    "autoResize",
  ]);
  return (
    <TextFieldPrimitive.TextArea
      data-slot="input-group-control"
      autoResize={local.autoResize}
      class={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent px-3 py-3 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-transparent",
        local.class,
      )}
      {...others}
    />
  );
};

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
