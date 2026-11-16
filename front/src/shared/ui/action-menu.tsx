"use client";

import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu";
import { MoreHorizontal } from "lucide-react";
import type { Option } from "./types";
import { usePopupIndicator } from "./popup-indicator";

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
