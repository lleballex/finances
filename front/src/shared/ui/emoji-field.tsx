"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";
import * as Picker from "emoji-picker-react/primitives";
import emojiData from "emoji-picker-react/data/emojis-ru";

export function EmojiField({
  label,
  placeholder = "Выберите эмодзи",
  value,
  onValueChange,
  disabled = false,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className="ui-field">
      <span className="ui-label" id={id}>
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="ui-input ui-select-trigger"
          aria-labelledby={id}
          disabled={disabled}
        >
          <span className={value ? undefined : "ui-emoji-placeholder"}>
            {value || placeholder}
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          className="ui-date-range-popup ui-emoji-popup"
          align="center"
          sideOffset={8}
        >
          <PopoverTitle className="ui-color-title">{label}</PopoverTitle>
          <Picker.Root
            className="ui-emoji-picker"
            emojiData={emojiData}
            columns={7}
            suggestedEmojis={[]}
            variationsDisabled
            keepSearchFocus
            labels={{
              searchLabel: "Поиск эмодзи",
              searchPlaceholder: "Поиск эмодзи",
              searchResultsNone: "Эмодзи не найдены",
              searchResultsOne: "Найден 1 эмодзи",
              searchResultsMany: "Найдено эмодзи: %n",
            }}
            onEmojiClick={(emoji) => {
              onValueChange(emoji.emoji);
              setOpen(false);
            }}
          >
            <div className="ui-emoji-search">
              <Picker.SearchInput className="ui-input" />
            </div>
            <Picker.Viewport>
              <Picker.List />
              <Picker.Empty />
            </Picker.Viewport>
          </Picker.Root>
        </PopoverContent>
      </Popover>
    </div>
  );
}
