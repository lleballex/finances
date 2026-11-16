"use client";

import type { ReactNode } from "react";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";

export function CollapsibleSection({
  open,
  onOpenChange,
  heading,
  children,
  className,
  headingClassName,
  panelClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heading: ReactNode;
  children: ReactNode;
  className?: string;
  headingClassName?: string;
  panelClassName?: string;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className={className}>
      <CollapsibleTrigger className={headingClassName}>
        {heading}
      </CollapsibleTrigger>
      <CollapsiblePanel className={panelClassName}>{children}</CollapsiblePanel>
    </Collapsible>
  );
}
