import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test } from "vitest";
import Home from "../app/page";

const agent = createAgent();

test("компоненты доступны агенту по именам и меняют значения", async () => {
  render(<Home />);
  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more");
  for (const entry of components)
    expect(entry.label, `${entry.component} ${entry.ref}`).toBeTruthy();
  const labels = components.map((entry) => entry.label);
  for (const label of [
    "Название",
    "Категория",
    "Учитывать в статистике",
    "Регулярная операция",
    "Тип операции",
  ]) {
    expect(labels).toContain(label);
  }
  const result = await agent.act({
    steps: [{ ref: "Название", action: "setValue", args: ["Продукты"] }],
  });
  expect(result.ok, result.error?.message).toBe(true);
  expect(screen.getByLabelText<HTMLInputElement>("Название").value).toBe(
    "Продукты",
  );
});

test("флажок и переключатель работают с клавиатуры", async () => {
  render(<Home />);
  const user = userEvent.setup();
  const checkbox = screen.getByRole("checkbox", {
    name: "Учитывать в статистике",
  });
  const toggle = screen.getByRole("switch", { name: "Регулярная операция" });
  checkbox.focus();
  await user.keyboard(" ");
  expect(checkbox.getAttribute("aria-checked")).toBe("false");
  toggle.focus();
  await user.keyboard(" ");
  expect(toggle.getAttribute("aria-checked")).toBe("true");
});

test("диалог закрывается отменой и возвращает фокус", async () => {
  render(<Home />);
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Открыть диалог" });
  await user.click(trigger);
  expect(
    screen.getByRole("dialog", { name: "Удалить категорию?" }),
  ).toBeTruthy();
  await user.click(
    within(
      screen.getByRole("dialog", { name: "Удалить категорию?" }),
    ).getByRole("button", { name: "Отмена" }),
  );
  expect(document.activeElement).toBe(trigger);
});
