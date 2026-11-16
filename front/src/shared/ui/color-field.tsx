"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
} from "@ui-sdk/react/color-picker";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";

export function ColorField({
  label,
  defaultValue = "#DDF45A",
  disabled = false,
  value: controlledValue,
  onValueChange,
  name,
}: {
  label: string;
  defaultValue?: string;
  disabled?: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
}) {
  const id = useId();
  const [internalValue, setValue] = useState(defaultValue);
  const value = controlledValue ?? internalValue;
  return (
    <div className="ui-field">
      {name && (
        <input type="hidden" name={name} value={value} disabled={disabled} />
      )}
      <span className="ui-label" id={id}>
        {label}
      </span>
      <Popover>
        <PopoverTrigger
          className="ui-input ui-select-trigger ui-color-trigger"
          aria-labelledby={id}
          disabled={disabled}
        >
          <span className="ui-color-value">
            <span
              className="ui-color-swatch"
              style={{ backgroundColor: value }}
            />
            {value.toUpperCase()}
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          className="ui-date-range-popup ui-color-popup"
          align="start"
          sideOffset={8}
        >
          <PopoverTitle className="ui-color-title">{label}</PopoverTitle>
          <ColorPicker
            aria-label={label}
            value={value}
            onValueChange={(nextValue, details) => {
              if (details.color.alpha < 1) {
                details.cancel();
                return;
              }
              setValue(nextValue);
              onValueChange?.(nextValue);
            }}
            format="hex"
          >
            <ColorPickerArea className="ui-color-area">
              <ColorPickerAreaThumb className="ui-color-thumb" />
            </ColorPickerArea>
            <ColorPickerSlider
              className="ui-color-slider"
              channel="hue"
              aria-label="Оттенок"
            >
              <ColorPickerSliderThumb className="ui-color-thumb" />
            </ColorPickerSlider>
            <div className="ui-color-input-row">
              <span
                className="ui-color-swatch"
                style={{ backgroundColor: value }}
              />
              <ColorPickerInput className="ui-input" aria-label="HEX цвет" />
            </div>
          </ColorPicker>
        </PopoverContent>
      </Popover>
    </div>
  );
}
