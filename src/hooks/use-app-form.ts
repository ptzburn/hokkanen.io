import { createFormHook, createFormHookContexts } from "@tanstack/solid-form";

import { MarkdownEditorField } from "~/components/form/markdown-editor-field.tsx";
import { OTPFieldComponent as OTPField } from "~/components/form/otp-field.tsx";
import { SelectField } from "~/components/form/select.tsx";
import { SubmitButton } from "~/components/form/submit-button.tsx";
import { TextField } from "~/components/form/text-field.tsx";
import { TextareaField } from "~/components/form/textarea-field.tsx";

type FieldAccessor = () => {
  state: { meta: { isTouched: boolean; isValid: boolean } };
  form: { state: { submissionAttempts: number } };
};

// A field is shown as invalid once it's been touched OR the form has been
// submitted at least once. Without the submission-attempt clause, fields that
// can't naturally fire blur (e.g. the markdown editor) never surface their
// error after a failed submit, leaving the user with a button that does
// nothing.
export const isFieldInvalid = (field: FieldAccessor): boolean => {
  const meta = field().state.meta;
  if (meta.isValid) return false;
  return meta.isTouched || field().form.state.submissionAttempts > 0;
};

type FormSubmitter = { handleSubmit: () => void | Promise<void> };

export const submitForm =
  (form: FormSubmitter): (e: SubmitEvent) => void => (e) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

// Export contexts so components can use them
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

// Create the app form hook with pre-bound components
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    OTPField,
    TextField,
    TextareaField,
    SelectField,
    MarkdownEditorField,
  },
  formComponents: {
    SubmitButton,
  },
});
