import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import { isFieldInvalid, useFieldContext } from "~/hooks/use-app-form.ts";
import "~/lib/milkdown/image-resize.css";
import { imageResizePlugins } from "~/lib/milkdown/image-resize.ts";
import { type JSX, onCleanup, onMount, Show } from "solid-js";
import { Field, FieldError, FieldLabel } from "../ui/field.tsx";

type MarkdownEditorFieldProps = {
  label?: string;
};

export function MarkdownEditorField(
  props: MarkdownEditorFieldProps,
): JSX.Element {
  const field = useFieldContext<string>();

  let editorEl: HTMLDivElement | undefined;
  let crepe: Crepe | undefined;

  onMount(() => {
    if (!editorEl) return;
    const initialValue = field().state.value ?? "";
    crepe = new Crepe({
      root: editorEl,
      defaultValue: initialValue,
      features: {
        [Crepe.Feature.ImageBlock]: false,
      },
    });
    crepe.editor.use(imageResizePlugins);
    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => {
        field().handleChange(markdown);
      });
    });
    void crepe.create();
  });

  onCleanup(() => {
    void crepe?.destroy();
  });

  return (
    <Field data-invalid={isFieldInvalid(field)}>
      <Show when={props.label}>
        <FieldLabel for={field().name}>{props.label}</FieldLabel>
      </Show>
      <div
        ref={editorEl}
        id={field().name}
        class="min-h-[400px] overflow-hidden rounded-md border bg-card"
      />
      <Show when={isFieldInvalid(field)}>
        <FieldError errors={field().state.meta.errors} />
      </Show>
    </Field>
  );
}
