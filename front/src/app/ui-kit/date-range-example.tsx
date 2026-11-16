"use client";

import { useState } from "react";
import { DateRangeField } from "@/shared/ui";

export function DateRangeExample() {
  const [range, setRange] = useState<[string, string]>(["", ""]);
  return (
    <DateRangeField
      label="Период"
      from={range[0]}
      to={range[1]}
      onChange={(from, to) => setRange([from, to])}
    />
  );
}
