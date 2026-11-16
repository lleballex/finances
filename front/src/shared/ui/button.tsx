"use client";

import type { ComponentProps } from "react";
import { Button as SdkButton } from "@ui-sdk/react/button";

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
