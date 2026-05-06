import { useMediaQuery } from "~/hooks/use-media-query.ts";
import Trash from "~icons/lucide/trash";
import { type Accessor, type JSX, type Setter, Show } from "solid-js";
import { Button } from "./ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.tsx";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer.tsx";
import { Spinner } from "./ui/spinner.tsx";

type DeletionDialogProps = {
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
  isPending: boolean | undefined;
  title?: string;
  description?: string;
  buttonText?: string;
  icon?: JSX.Element;
  onDelete: () => Promise<void>;
};

export function DeletionDialog(props: DeletionDialogProps): JSX.Element {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const defaultTitle = "Are you sure?";
  const defaultDescription =
    "This action cannot be undone. This will permanently delete your data.";
  const defaultButtonText = "Delete";

  const ActionButtons = () => (
    <>
      <Button
        variant="outline"
        disabled={props.isPending}
        onClick={() => props.setIsOpen(false)}
      >
        Cancel
      </Button>
      <Button
        variant="destructive"
        disabled={props.isPending}
        onClick={() => props.onDelete()}
      >
        {props.buttonText ?? defaultButtonText}
        <Show when={!props.isPending} fallback={<Spinner />}>
          {props.icon ? props.icon : <Trash />}
        </Show>
      </Button>
    </>
  );

  return (
    <Show
      when={isDesktop()}
      fallback={
        <Drawer
          open={props.isOpen()}
          onOpenChange={props.isPending ? undefined : props.setIsOpen}
        >
          <DrawerContent>
            <DrawerHeader class="text-left">
              <DrawerTitle>
                {props.title ?? defaultTitle}
              </DrawerTitle>
              <DrawerDescription>
                {props.description ?? defaultDescription}
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter class="pt-2">
              <ActionButtons />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      }
    >
      <Dialog
        open={props.isOpen()}
        onOpenChange={props.isPending ? undefined : props.setIsOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {props.title ?? defaultTitle}
            </DialogTitle>
            <DialogDescription>
              {props.description ?? defaultDescription}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <ActionButtons />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Show>
  );
}
