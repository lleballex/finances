"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  type SelectProps,
} from "@ui-sdk/react/select";
import { ChevronDown } from "lucide-react";
import type { Option } from "./types";
import { usePopupIndicator } from "./popup-indicator";

export function SelectField({
  label,
  options,
  placeholder = "Выберите",
  defaultValue,
  disabled,
  value,
  onValueChange,
}: {
  label: string;
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  value?: string | null;
  onValueChange?: Extract<
    SelectProps<string>,
    { multiple?: false }
  >["onValueChange"];
}) {
  const popupRef = usePopupIndicator();
  return (
    <Select
      items={options}
      placeholder={placeholder}
      defaultValue={defaultValue}
      disabled={disabled}
      value={value}
      onValueChange={onValueChange}
    >
      <div className="ui-field">
        <SelectLabel className="ui-label">{label}</SelectLabel>
        <SelectTrigger className="ui-input ui-select-trigger">
          <SelectValue />
          <ChevronDown size={18} aria-hidden="true" />
        </SelectTrigger>
      </div>
      <SelectContent className="ui-popup" ref={popupRef}>
        {options.map((option) => (
          <SelectItem
            className="ui-popup-item"
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
