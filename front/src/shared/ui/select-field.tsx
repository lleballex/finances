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
import { ChevronDown, LoaderCircle } from "lucide-react";
import type { Option } from "./types";
import { usePopupIndicator } from "./popup-indicator";

export function SelectField({
  label,
  options,
  placeholder = "Выберите",
  defaultValue,
  disabled,
  loading = false,
  value,
  onValueChange,
}: {
  label: string;
  options: Option[];
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  loading?: boolean;
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
      disabled={disabled || loading}
      value={value}
      onValueChange={onValueChange}
    >
      <div className="ui-field">
        <SelectLabel className="ui-label">{label}</SelectLabel>
        <SelectTrigger className="ui-input ui-select-trigger">
          <SelectValue />
          {loading ? (
            <LoaderCircle
              size={18}
              className="ui-spinner"
              aria-label="Загрузка категорий"
            />
          ) : (
            <ChevronDown size={18} aria-hidden="true" />
          )}
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
