import { Button } from "~/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog.tsx";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer.tsx";
import { useMediaQuery } from "~/hooks/use-media-query.ts";
import { type Accessor, type JSX, Show } from "solid-js";

type ResponsiveEditDialogProps = {
  isOpen: Accessor<boolean>;
  setIsOpen: (open: boolean) => void;
  title: string;
  description?: string;
  children: () => JSX.Element;
  class?: string;
};

export function ResponsiveEditDialog(
  props: ResponsiveEditDialogProps,
): JSX.Element {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Show
      when={isDesktop()}
      fallback={
        <Drawer
          open={props.isOpen()}
          onOpenChange={props.setIsOpen}
          onInitialFocus={(e) => e.preventDefault()}
        >
          <DrawerContent class="max-h-[90vh]">
            <DrawerHeader class="text-left">
              <DrawerTitle>{props.title}</DrawerTitle>
              <Show when={props.description}>
                <DrawerDescription>
                  {props.description}
                </DrawerDescription>
              </Show>
            </DrawerHeader>
            <div class="overflow-y-auto px-4">
              {props.children()}
            </div>
            <DrawerFooter class="pt-2">
              <DrawerClose
                as={Button<"button">}
                variant="outline"
              >
                Cancel
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      }
    >
      <Dialog open={props.isOpen()} onOpenChange={props.setIsOpen}>
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          class={props.class || "max-h-[90vh] overflow-y-auto"}
        >
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <Show when={props.description}>
              <DialogDescription>
                {props.description}
              </DialogDescription>
            </Show>
          </DialogHeader>
          {props.children()}
        </DialogContent>
      </Dialog>
    </Show>
  );
}
