import { submitForm, useAppForm } from "~/hooks/use-app-form.ts";
import { PostFormSchema, type PostFormValues } from "~/lib/schemas/posts.ts";
import type { JSX } from "solid-js";

type PostFormProps = {
  defaultValues?: Partial<PostFormValues>;
  submitLabel: string;
  onSubmit: (values: PostFormValues) => Promise<void>;
};

export function PostForm(props: PostFormProps): JSX.Element {
  const form = useAppForm(() => ({
    defaultValues: {
      title: props.defaultValues?.title ?? "",
      excerpt: props.defaultValues?.excerpt ?? "",
      content: props.defaultValues?.content ?? "",
    } satisfies PostFormValues,
    validators: {
      onSubmit: PostFormSchema,
    },
    onSubmit: async ({ value }) => {
      await props.onSubmit(value);
    },
  }));

  return (
    <form onSubmit={submitForm(form)} class="flex flex-col gap-6">
      <form.AppField name="title">
        {(field) => (
          <field.TextField
            label="Title"
            placeholder="Post title"
          />
        )}
      </form.AppField>

      <form.AppField name="excerpt">
        {(field) => (
          <field.TextareaField
            label="Excerpt"
            placeholder="Short summary shown on the blog index"
            rows={3}
          />
        )}
      </form.AppField>

      <form.AppField name="content">
        {(field) => <field.MarkdownEditorField label="Content" />}
      </form.AppField>

      <form.AppForm>
        <form.SubmitButton>{props.submitLabel}</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
