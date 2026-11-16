"use client";

import type { ComponentProps, ReactNode } from "react";
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
  leading?: ReactNode;
};
export function TextField({
  label,
  description,
  error,
  leading,
  ...props
}: TextFieldProps) {
  return (
    <Field className="ui-field" invalid={error ? true : undefined}>
      <FieldLabel className="ui-label">{label}</FieldLabel>
      {leading ? (
        <div className="ui-input-leading">
          <span aria-hidden="true">{leading}</span>
          <Input className="ui-input" {...props} />
        </div>
      ) : (
        <Input className="ui-input" {...props} />
      )}
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
