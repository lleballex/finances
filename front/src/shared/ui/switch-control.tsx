"use client";

import type { ComponentProps } from "react";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";

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
