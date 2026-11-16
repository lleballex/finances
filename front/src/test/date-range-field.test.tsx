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

test("границы периода можно очистить и выбрать независимо", async () => {
  const user = userEvent.setup();
  render(<Example />);
  await user.click(screen.getByRole("button", { name: /Период/ }));
  const dialog = screen.getByRole("dialog", { name: "Выберите период" });
  await user.click(
    within(dialog).getByRole("button", { name: "Очистить «От»" }),
  );
  expect(screen.getByRole("button", { name: /… — 12.11.2026/ })).toBeTruthy();
  await user.click(
    within(dialog).getByRole("button", { name: /До: 12.11.2026/ }),
  );
  await user.click(
    within(dialog).getByRole("button", { name: "Очистить «До»" }),
  );
  expect(screen.getByRole("button", { name: /Всё время/ })).toBeTruthy();
  await user.click(
    within(dialog).getByRole("gridcell", { name: /12 ноября 2026/ }),
  );
  expect(screen.getByRole("button", { name: /… — 12.11.2026/ })).toBeTruthy();
});

test("после выбора начала предлагает конец и показывает предварительный период", async () => {
  const user = userEvent.setup();
  render(<Example />);
  await user.click(screen.getByRole("button", { name: /Период/ }));
  const dialog = screen.getByRole("dialog", { name: "Выберите период" });
  await user.click(
    within(dialog).getByRole("button", { name: /До: 12.11.2026/ }),
  );
  await user.click(
    within(dialog).getByRole("button", { name: "Очистить «До»" }),
  );
  await user.click(
    within(dialog).getByRole("button", { name: /От: 03.11.2026/ }),
  );
  const calendar = dialog;
  await user.click(
    within(calendar).getByRole("gridcell", { name: /, 4 ноября 2026/ }),
  );
  expect(
    within(calendar)
      .getByRole("button", { name: /До: Не указано/ })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  await user.hover(
    within(calendar).getByRole("gridcell", { name: /, 8 ноября 2026/ }),
  );
  expect(
    within(calendar)
      .getByRole("gridcell", { name: /, 6 ноября 2026/ })
      .hasAttribute("data-between"),
  ).toBe(true);
  expect(
    within(calendar)
      .getByRole("gridcell", { name: /, 8 ноября 2026/ })
      .hasAttribute("data-between"),
  ).toBe(true);
  await user.click(
    within(calendar).getByRole("gridcell", { name: /, 8 ноября 2026/ }),
  );
  expect(
    screen.getByRole("button", { name: /04.11.2026 — 08.11.2026/ }),
  ).toBeTruthy();
});
