import { createFormHook, createFormHookContexts } from "@tanstack/solid-form";

import { MarkdownEditorField } from "~/components/form/markdown-editor-field.tsx";
import { OTPFieldComponent as OTPField } from "~/components/form/otp-field.tsx";
import { SelectField } from "~/components/form/select.tsx";
import { SubmitButton } from "~/components/form/submit-button.tsx";
import { TextField } from "~/components/form/text-field.tsx";
import { TextareaField } from "~/components/form/textarea-field.tsx";

type FieldAccessor = () => {
  state: { meta: { isTouched: boolean; isValid: boolean } };
};

export const isFieldInvalid = (field: FieldAccessor): boolean =>
  field().state.meta.isTouched && !field().state.meta.isValid;

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
