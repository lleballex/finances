import { render, screen, waitFor, within } from "@testing-library/react";
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

test("сегментный переключатель меняет выбранный вариант стрелками", async () => {
  render(<Home />);
  const user = userEvent.setup();
  const first = screen.getByRole("radio", { name: "Все" });
  first.focus();
  await user.keyboard("{ArrowRight}");
  expect(
    screen.getByRole("radio", { name: "Расходы" }).getAttribute("aria-checked"),
  ).toBe("true");
});

test("плашка списка следует за активным пунктом", async () => {
  render(<Home />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: "Категория" }));
  const list = screen.getByRole("listbox", { name: "Категория" });
  const cafe = within(list).getByRole("option", { name: "Кафе" });
  Object.defineProperty(cafe, "offsetTop", { configurable: true, value: 48 });
  await user.hover(cafe);
  await waitFor(() =>
    expect(list.style.getPropertyValue("--popup-indicator-top")).toBe("48px"),
  );
});

test("плашка скрывается при наведении на недоступный пункт", async () => {
  render(<Home />);
  const user = userEvent.setup();
  await user.click(
    screen.getByRole("button", { name: "Действия с категорией" }),
  );
  const menu = screen.getByRole("menu", { name: "Действия с категорией" });
  await user.hover(within(menu).getByRole("menuitem", { name: "Изменить" }));
  await waitFor(() =>
    expect(menu.hasAttribute("data-indicator-ready")).toBe(true),
  );
  await user.hover(
    within(menu).getByRole("menuitem", { name: "Недоступное действие" }),
  );
  await waitFor(() =>
    expect(menu.hasAttribute("data-indicator-ready")).toBe(false),
  );
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
