"use client";

import type { ComponentProps } from "react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";

type TextFieldProps = ComponentProps<typeof Input> & {
  label: string;
  description?: string;
  error?: string;
};
export function TextField({
  label,
  description,
  error,
  ...props
}: TextFieldProps) {
  return (
    <Field className="ui-field" invalid={error ? true : undefined}>
      <FieldLabel className="ui-label">{label}</FieldLabel>
      <Input className="ui-input" {...props} />
      {description && (
        <FieldDescription className="ui-description">
          {description}
        </FieldDescription>
      )}
      {error && (
        <FieldError className="ui-error" match>
          {error}
        </FieldError>
      )}
    </Field>
  );
}
