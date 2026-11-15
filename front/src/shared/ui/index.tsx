"use client";

import type { ComponentProps, ReactNode } from "react";
import { useCallback, useLayoutEffect, useRef } from "react";
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

function usePopupIndicator() {
  return useCallback((popup: HTMLDivElement | null) => {
    if (!popup) return;
    const update = () => {
      const active =
        popup.querySelector<HTMLElement>(
          ".ui-popup-item[data-highlighted]:not([data-disabled])",
        ) ??
        popup.querySelector<HTMLElement>(
          ".ui-popup-item[data-selected]:not([data-disabled])",
        );
      if (!popup.hasAttribute("data-open") || !active) {
        popup.removeAttribute("data-indicator-ready");
        return;
      }
      popup.style.setProperty("--popup-indicator-top", `${active.offsetTop}px`);
      popup.style.setProperty(
        "--popup-indicator-left",
        `${active.offsetLeft}px`,
      );
      popup.style.setProperty(
        "--popup-indicator-width",
        `${active.offsetWidth}px`,
      );
      popup.style.setProperty(
        "--popup-indicator-height",
        `${active.offsetHeight}px`,
      );
      popup.setAttribute("data-indicator-ready", "");
    };
    const observer = new MutationObserver(update);
    observer.observe(popup, {
      subtree: true,
      attributes: true,
      attributeFilter: [
        "data-open",
        "data-highlighted",
        "data-selected",
        "data-disabled",
      ],
    });
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    resizeObserver?.observe(popup);
    popup
      .querySelectorAll<HTMLElement>(".ui-popup-item")
      .forEach((item) => resizeObserver?.observe(item));
    update();
    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
    };
  }, []);
}
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
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const group =
      containerRef.current?.querySelector<HTMLElement>(".ui-segments");
    if (!group) return;

    const updateIndicator = () => {
      const selected = group.querySelector<HTMLElement>(
        '[role="radio"][aria-checked="true"]',
      );
      if (!selected) {
        group.removeAttribute("data-indicator-ready");
        return;
      }
      group.style.setProperty("--indicator-left", `${selected.offsetLeft}px`);
      group.style.setProperty("--indicator-top", `${selected.offsetTop}px`);
      group.style.setProperty("--indicator-width", `${selected.offsetWidth}px`);
      group.style.setProperty(
        "--indicator-height",
        `${selected.offsetHeight}px`,
      );
      group.setAttribute("data-indicator-ready", "");
    };
    updateIndicator();
    const mutationObserver = new MutationObserver(updateIndicator);
    mutationObserver.observe(group, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-checked"],
    });
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(updateIndicator);
    resizeObserver?.observe(group);
    group
      .querySelectorAll<HTMLElement>('[role="radio"]')
      .forEach((radio) => resizeObserver?.observe(radio));
    return () => {
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
    };
  }, [options]);

  return (
    <div ref={containerRef}>
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
    </div>
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
export function ActionMenu({
  label = "Действия",
  options,
  onAction,
}: {
  label?: string;
  options: Option[];
  onAction?: (value: string) => void;
}) {
  const popupRef = usePopupIndicator();
  return (
    <Menu onAction={onAction}>
      <MenuTrigger className="ui-button ui-button--icon" aria-label={label}>
        <MoreHorizontal size={20} aria-hidden="true" />
      </MenuTrigger>
      <MenuContent className="ui-popup" ref={popupRef}>
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
