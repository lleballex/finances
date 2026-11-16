"use client";

import type { ReactNode } from "react";

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
