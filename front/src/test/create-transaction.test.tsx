import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { Providers } from "../app/providers";
import { api } from "../shared/api/client";
import { CreateTransaction } from "../features/transactions/create-transaction";

afterEach(() => vi.restoreAllMocks());

test("при получении категорий остальные поля формы остаются доступны", async () => {
  vi.spyOn(api, "get").mockImplementation(() => new Promise(() => {}));
  const user = userEvent.setup();
  render(
    <Providers>
      <CreateTransaction onCreated={() => {}} />
    </Providers>,
  );
  await user.click(screen.getByRole("button", { name: "Добавить транзакцию" }));
  expect(
    screen.getByRole("dialog", { name: "Добавить транзакцию" }),
  ).toBeTruthy();
  expect(screen.getByLabelText("Загрузка категорий")).toBeTruthy();
  expect(screen.getByRole("textbox", { name: "Сумма" })).toBeTruthy();
  expect(screen.getByRole("textbox", { name: "Описание" })).toBeTruthy();
  expect(screen.queryByText(/Получаем категории/)).toBeNull();
});

test("при отсутствии категорий форма остаётся доступной", async () => {
  vi.spyOn(api, "get").mockResolvedValue({ data: [] });
  const user = userEvent.setup();
  render(
    <Providers>
      <CreateTransaction onCreated={() => {}} />
    </Providers>,
  );
  await user.click(screen.getByRole("button", { name: "Добавить транзакцию" }));
  expect(
    await screen.findByRole("link", { name: "Создать категорию" }),
  ).toBeTruthy();
  expect(screen.getByRole("textbox", { name: "Сумма" })).toBeTruthy();
});

test("сохраняет выбранную категорию и сумму через API", async () => {
  vi.spyOn(api, "get").mockResolvedValue({
    data: [
      {
        id: "e7161ff3-a59e-435a-bd5e-c7695db595bc",
        name: "Продукты",
        type: "expense",
        emoji: "🥑",
        isRegular: true,
        parentId: null,
      },
    ],
  });
  const post = vi
    .spyOn(api, "post")
    .mockResolvedValue({ data: { id: "created" } });
  const onCreated = vi.fn();
  const user = userEvent.setup();
  render(
    <Providers>
      <CreateTransaction onCreated={onCreated} />
    </Providers>,
  );
  await user.click(screen.getByRole("button", { name: "Добавить транзакцию" }));
  const select = await screen.findByRole("combobox", { name: "Категория" });
  await user.click(select);
  await user.click(await screen.findByRole("option", { name: /Продукты/ }));
  expect(
    screen
      .getByRole("switch", { name: "Регулярная транзакция" })
      .getAttribute("aria-checked"),
  ).toBe("true");
  await user.type(screen.getByRole("textbox", { name: "Сумма" }), "123,45");
  await user.click(screen.getByRole("button", { name: "Сохранить" }));
  await vi.waitFor(() => expect(onCreated).toHaveBeenCalled());
  expect(post).toHaveBeenCalledWith(
    "/transactions",
    expect.objectContaining({
      categoryId: "e7161ff3-a59e-435a-bd5e-c7695db595bc",
      amount: "123.45",
      isRegular: true,
    }),
  );
});

test("дата обновляет период до ручного изменения, смена категории сбрасывает регулярность", async () => {
  vi.spyOn(api, "get").mockResolvedValue({
    data: [
      {
        id: "e7161ff3-a59e-435a-bd5e-c7695db595bc",
        name: "Продукты",
        type: "expense",
        emoji: "🥑",
        isRegular: true,
        parentId: null,
      },
      {
        id: "e7161ff3-a59e-435a-bd5e-c7695db595bd",
        name: "Кафе",
        type: "expense",
        emoji: "☕",
        isRegular: false,
        parentId: null,
      },
    ],
  });
  const user = userEvent.setup();
  render(
    <Providers>
      <CreateTransaction onCreated={() => {}} />
    </Providers>,
  );
  await user.click(screen.getByRole("button", { name: "Добавить транзакцию" }));
  await user.click(await screen.findByRole("combobox", { name: "Категория" }));
  await user.click(await screen.findByRole("option", { name: /Продукты/ }));
  const toggle = screen.getByRole("switch", { name: "Регулярная транзакция" });
  expect(toggle.getAttribute("aria-checked")).toBe("true");
  await user.click(toggle);
  await user.click(toggle);
  await user.click(screen.getByRole("combobox", { name: "Категория" }));
  await user.click(await screen.findByRole("option", { name: /Кафе/ }));
  expect(toggle.getAttribute("aria-checked")).toBe("false");
  const date = screen.getByRole("textbox", { name: "Дата операции" });
  await user.clear(date);
  await user.type(date, "05.10.2026");
  await user.tab();
  expect(
    (screen.getByLabelText("Учётный период") as HTMLInputElement).value,
  ).toBe("2026-10");
  fireEvent.input(screen.getByLabelText("Учётный период"), {
    target: { value: "2026-08" },
  });
  await user.clear(date);
  await user.type(date, "06.09.2026");
  await user.tab();
  expect(
    (screen.getByLabelText("Учётный период") as HTMLInputElement).value,
  ).toBe("2026-08");
});

test("ошибка категорий не закрывает и не заменяет форму", async () => {
  vi.spyOn(api, "get").mockRejectedValue(new Error("network"));
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={client}>
      <CreateTransaction onCreated={() => {}} />
    </QueryClientProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Добавить транзакцию" }));
  expect(await screen.findByText(/Не удалось получить категории/)).toBeTruthy();
  expect(screen.getByRole("textbox", { name: "Сумма" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Повторить" })).toBeTruthy();
});
