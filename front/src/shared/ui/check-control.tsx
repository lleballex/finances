"use client";

import type { ComponentProps } from "react";
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { Check } from "lucide-react";

export function CheckControl({
  label,
  ...props
}: ComponentProps<typeof Checkbox> & { label: string }) {
  return (
    <label className="ui-choice">
      <Checkbox className="ui-checkbox" {...props}>
        <CheckboxIndicator>
          <Check size={15} aria-hidden="true" />
        </CheckboxIndicator>
      </Checkbox>
      <span>{label}</span>
    </label>
  );
}
