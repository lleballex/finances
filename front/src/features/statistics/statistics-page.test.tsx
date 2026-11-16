import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { api } from "@/shared/api/client";
import { StatisticsPage } from "./statistics-page";

vi.mock("@/shared/api/client", () => ({ api: { get: vi.fn() } }));
vi.mock("@/features/transactions/create-transaction", () => ({
  CreateTransaction: () => <button>Добавить транзакцию</button>,
}));
beforeEach(() => vi.resetAllMocks());
it("drills into category distribution and returns with the keyboard", async () => {
  const categories = [
    {
      id: "parent",
      name: "Еда",
      type: "expense",
      color: "#123456",
      emoji: "🍎",
      parentId: null,
    },
    {
      id: "child",
      name: "Кафе",
      type: "expense",
      color: "#654321",
      emoji: "☕",
      parentId: "parent",
    },
  ];
  const transaction = (categoryId: string, amount: string) => ({
    id: categoryId,
    categoryId,
    amount,
    date: "2025-01-01",
    period: "2025-01",
    category: categoryId,
    regular: false,
    emoji: "🍎",
    color: "#123456",
    description: null,
  });
  vi.mocked(api.get).mockImplementation(async (path) =>
    path === "/categories"
      ? { data: categories }
      : {
          data: {
            data: [transaction("parent", "-10"), transaction("child", "-5")],
            meta: { total: 2 },
          },
        },
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <StatisticsPage />
    </QueryClientProvider>,
  );
  const segment = await screen.findByRole("button", {
    name: /Еда: 15 ₽, показать подкатегории/,
  });
  const user = userEvent.setup();
  await user.click(segment);
  expect(screen.getByText("Без подкатегории")).toBeTruthy();
  expect(screen.getByText("Кафе")).toBeTruthy();
  const back = screen.getByRole("button", { name: "Вернуться к категориям" });
  back.focus();
  await user.keyboard("{Enter}");
  expect(screen.queryByText("Без подкатегории")).toBeNull();
});
