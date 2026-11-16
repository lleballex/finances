import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test } from "vitest";
import { MonthField } from "../shared/ui/month-field";

function Example() {
  const [value, setValue] = useState("2026-11");
  return <MonthField label="Учётный месяц" value={value} onChange={setValue} />;
}

test("выбор года и месяца обновляет значение и возвращает фокус", async () => {
  const user = userEvent.setup();
  render(<Example />);
  const trigger = screen.getByRole("button", {
    name: /Учётный месяц Ноябрь 2026/,
  });
  expect(
    createAgent()
      .snapshot()
      .some((item) => item.label?.includes("Учётный месяц")),
  ).toBe(true);
  await user.click(trigger);
  const popup = screen.getByRole("dialog", { name: "Выберите месяц" });
  await user.click(
    within(popup).getByRole("button", { name: "Предыдущий год" }),
  );
  expect(within(popup).getByText("2025")).toBeTruthy();
  await user.click(within(popup).getByRole("button", { name: "Август" }));
  expect(
    screen.getByRole("button", { name: /Учётный месяц Август 2025/ }),
  ).toBe(trigger);
  expect(document.activeElement).toBe(trigger);
  await user.click(trigger);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog", { name: "Выберите месяц" })).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
