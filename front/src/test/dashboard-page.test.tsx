import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { api } from "@/shared/api/client";

vi.mock("@/shared/api/client", () => ({ api: { get: vi.fn() } }));
vi.mock("@/features/transactions/create-transaction", () => ({
  CreateTransaction: () => <button>Добавить транзакцию</button>,
}));
function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <DashboardPage />
    </QueryClientProvider>,
  );
}
beforeEach(() => vi.resetAllMocks());
describe("dashboard", () => {
  it("offers transaction creation when the account is empty", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { data: [], meta: { total: 0 } },
    });
    renderPage();
    expect(await screen.findByText("Транзакций пока нет")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Добавить транзакцию" }),
    ).toBeTruthy();
  });
  it("reports a loading error", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("network"));
    renderPage();
    expect((await screen.findByRole("alert")).textContent).toContain(
      "Не удалось загрузить обзор",
    );
  });
  it("describes a category decrease and shows its emoji on the category color", async () => {
    const now = new Date();
    const date = (offset: number) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    };
    const item = (offset: number, amount: string) => ({
      id: String(offset),
      categoryId: "food",
      category: "Продукты",
      emoji: "🥑",
      color: "#aabbcc",
      date: date(offset),
      period: date(offset).slice(0, 7),
      amount,
      regular: false,
      description: null,
    });
    vi.mocked(api.get).mockResolvedValue({
      data: { data: [item(0, "-60"), item(-1, "-100")], meta: { total: 2 } },
    });
    renderPage();
    expect(
      (await screen.findByText(/Расход сократился с/)).textContent,
    ).toContain("100 ₽ до 60 ₽");
    const emoji = screen.getByText("🥑");
    expect(emoji.style.backgroundColor).toBe("rgb(170, 187, 204)");
    expect(screen.getByText("−40%")).toBeTruthy();
  });
});
