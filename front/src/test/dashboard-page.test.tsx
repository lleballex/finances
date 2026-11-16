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
});
