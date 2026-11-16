import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test } from "vitest";
import { DateRangeField } from "../shared/ui/date-range-field";

function Example() {
  const [range, setRange] = useState<[string, string]>([
    "2026-11-03",
    "2026-11-12",
  ]);
  return (
    <DateRangeField
      label="Период"
      from={range[0]}
      to={range[1]}
      onChange={(from, to) => setRange([from, to])}
    />
  );
}

test("календарь доступен по имени, сбрасывает период и возвращает фокус", async () => {
  const user = userEvent.setup();
  render(<Example />);
  const trigger = screen.getByRole("button", { name: /Период/ });
  expect(
    createAgent()
      .snapshot()
      .some((entry) => entry.label?.includes("Период")),
  ).toBe(true);
  await user.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "Выберите период" });
  expect(within(dialog).getByRole("grid")).toBeTruthy();
  await user.click(
    within(dialog).getByRole("button", { name: "За всё время" }),
  );
  expect(screen.getByRole("button", { name: /Всё время/ })).toBeTruthy();
  expect(document.activeElement).toBe(trigger);
});
