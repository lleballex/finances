"use client";

import { useState } from "react";
import { DateField, DateRangeField } from "@/shared/ui";

export function DateExample() {
  const [date, setDate] = useState("");
  return <DateField label="Дата" value={date} onChange={setDate} />;
}

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
