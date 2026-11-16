"use client";

import { useLayoutEffect, useRef } from "react";
import { Radio, RadioGroup } from "@ui-sdk/react/radio";
import type { RadioGroupOptions } from "@ui-sdk/core/radio";
import type { Option } from "./types";

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
