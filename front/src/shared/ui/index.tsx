"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button as SdkButton } from "@ui-sdk/react/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import type { RadioGroupOptions } from "@ui-sdk/core/radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  type SelectProps,
} from "@ui-sdk/react/select";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Check, ChevronDown, MoreHorizontal, X } from "lucide-react";

type ButtonProps = ComponentProps<typeof SdkButton> & {
  variant?: "primary" | "secondary" | "text" | "icon";
};
export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <SdkButton
      className={`ui-button ui-button--${variant} ${className}`}
      {...props}
    />
  );
}

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

type Option = { value: string; label: string; disabled?: boolean };
export function SegmentedControl({
  label,
  options,
  defaultValue,
  value,
  onValueChange,
}: {
  label: string;
  options: Option[];
  defaultValue?: string;
  value?: string | null;
  onValueChange?: RadioGroupOptions<string>["onValueChange"];
}) {
  return (
    <RadioGroup
      className="ui-segments"
      aria-label={label}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
    >
      {options.map((option) => (
        <Radio
          className="ui-segment"
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}
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
      <SelectContent className="ui-popup">
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
export function ActionMenu({
  label = "Действия",
  options,
  onAction,
}: {
  label?: string;
  options: Option[];
  onAction?: (value: string) => void;
}) {
  return (
    <Menu onAction={onAction}>
      <MenuTrigger className="ui-button ui-button--icon" aria-label={label}>
        <MoreHorizontal size={20} aria-hidden="true" />
      </MenuTrigger>
      <MenuContent className="ui-popup">
        {options.map((option) => (
          <MenuItem
            className="ui-popup-item"
            value={option.value}
            key={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Подтвердить",
  onConfirm,
}: {
  trigger: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm?: () => void;
}) {
  return (
    <Dialog>
      <DialogTrigger className="ui-button ui-button--secondary">
        {trigger}
      </DialogTrigger>
      <DialogBackdrop className="ui-dialog-backdrop" />
      <DialogContent className="ui-dialog">
        <DialogClose
          className="ui-dialog-x ui-button ui-button--icon"
          aria-label="Закрыть"
        >
          <X size={20} aria-hidden="true" />
        </DialogClose>
        <DialogTitle className="ui-dialog-title">{title}</DialogTitle>
        <DialogDescription className="ui-dialog-description">
          {description}
        </DialogDescription>
        <div className="ui-dialog-actions">
          <DialogClose className="ui-button ui-button--secondary">
            Отмена
          </DialogClose>
          <DialogClose
            className="ui-button ui-button--primary"
            onClick={onConfirm}
          >
            {confirmLabel}
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
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
export function SwitchControl({
  label,
  ...props
}: ComponentProps<typeof Switch> & { label: string }) {
  return (
    <label className="ui-choice">
      <Switch className="ui-switch" {...props}>
        <SwitchThumb className="ui-switch-thumb" />
      </Switch>
      <span>{label}</span>
    </label>
  );
}
export function Card({
  children,
  tone = "light",
  className = "",
}: {
  children: ReactNode;
  tone?: "light" | "dark" | "lime";
  className?: string;
}) {
  return (
    <div className={`ui-card ui-card--${tone} ${className}`}>{children}</div>
  );
}
