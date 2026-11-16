import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { afterEach, expect, test, vi } from "vitest";
import { Providers } from "../app/providers";
import { TransactionsPage } from "../features/transactions/transactions-page";

afterEach(() => vi.unstubAllGlobals());

test("список получает операции от API, позволяет группировать и сворачивать их", async () => {
  const user = userEvent.setup();
  const fetchTransactions = vi.fn().mockImplementation(async (url: string) => {
    const month = new URL(url).searchParams.get("grouping") === "month";
    return {
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1",
            date: "2026-11-15",
            category: "Кофе",
            amount: "-480.00",
            emoji: "☕",
            color: "#f2e9dd",
            regular: false,
            period: "2026-11",
          },
        ],
        meta: { page: 1, limit: 20, total: 1 },
        groupTotals: { [month ? "2026-11" : "2026-11-15"]: "-480.00" },
      }),
    };
  });
  vi.stubGlobal("fetch", fetchTransactions);
  render(
    <Providers>
      <TransactionsPage />
    </Providers>,
  );
  expect(await screen.findByText("Кофе")).toBeTruthy();
  expect(fetchTransactions).toHaveBeenCalledWith(
    expect.stringContaining("/transactions?"),
    expect.objectContaining({ credentials: "include" }),
  );
  expect(
    createAgent()
      .snapshot()
      .some((entry) => entry.label === "Поиск"),
  ).toBe(true);
  await user.click(screen.getByRole("radio", { name: "По месяцам" }));
  expect(
    await screen.findByRole("button", { name: /ноябрь 2026/ }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Свернуть все" }));
  expect(
    within(
      screen.getByRole("region", { name: "Список транзакций" }),
    ).queryByText("Кофе"),
  ).toBeNull();
  await user.click(screen.getByRole("button", { name: "Раскрыть все" }));
  expect(screen.getByText("Кофе")).toBeTruthy();
});

test("пустой ответ API показывает пустое состояние", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [],
        meta: { page: 1, limit: 20, total: 0 },
        groupTotals: {},
      }),
    }),
  );
  render(
    <Providers>
      <TransactionsPage />
    </Providers>,
  );
  expect(await screen.findByText("Транзакции не найдены")).toBeTruthy();
});

test("редактирует и удаляет транзакцию с подтверждением", async () => {
  const { api } = await import("../shared/api/client");
  const category = {
    id: "e7161ff3-a59e-435a-bd5e-c7695db595bc",
    name: "Кофе",
    type: "expense",
    emoji: "☕",
    isRegular: false,
    parentId: null,
  };
  const item = {
    id: "one",
    categoryId: category.id,
    description: "Заметка",
    date: "2026-11-15",
    category: "Кофе",
    amount: "-480.00",
    emoji: "☕",
    color: "#f2e9dd",
    regular: true,
    period: "2026-10",
  };
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [item],
        meta: { page: 1, limit: 20, total: 1 },
        groupTotals: { "2026-11-15": "-480.00" },
      }),
    }),
  );
  vi.spyOn(api, "get").mockResolvedValue({ data: [category] });
  const put = vi.spyOn(api, "put").mockResolvedValue({ data: {} });
  const remove = vi.spyOn(api, "delete").mockResolvedValue({ data: {} });
  const user = userEvent.setup();
  render(
    <Providers>
      <TransactionsPage />
    </Providers>,
  );
  await user.click(
    await screen.findByRole("button", { name: /Действия с транзакцией Кофе/ }),
  );
  await user.click(await screen.findByRole("menuitem", { name: "Изменить" }));
  expect(screen.getByRole("textbox", { name: "Описание" })).toHaveProperty(
    "value",
    "Заметка",
  );
  expect(screen.getByRole("textbox", { name: "Сумма" })).toHaveProperty(
    "value",
    "480.00",
  );
  await user.clear(screen.getByRole("textbox", { name: "Сумма" }));
  await user.type(screen.getByRole("textbox", { name: "Сумма" }), "700");
  await user.click(screen.getByRole("button", { name: "Сохранить" }));
  await vi.waitFor(() =>
    expect(put).toHaveBeenCalledWith(
      "/transactions/one",
      expect.objectContaining({
        amount: "700",
        description: "Заметка",
        accountingPeriod: "2026-10-01",
        isRegular: true,
      }),
    ),
  );
  await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await user.click(
    await screen.findByRole("button", { name: /Действия с транзакцией Кофе/ }),
  );
  await user.click(await screen.findByRole("menuitem", { name: "Удалить" }));
  expect(remove).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Удалить" }));
  await vi.waitFor(() =>
    expect(remove).toHaveBeenCalledWith("/transactions/one"),
  );
  vi.restoreAllMocks();
});
