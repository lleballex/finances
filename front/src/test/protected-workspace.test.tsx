import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ProtectedWorkspace } from "../features/auth/protected-workspace";

let pathname = "/dashboard";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

afterEach(() => vi.unstubAllGlobals());

test("общая оболочка и сессия сохраняются при переходе между разделами", async () => {
  const fetchSession = vi
    .fn()
    .mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "1",
        firstName: "Алексей",
        lastName: null,
        avatarUrl: null,
      }),
    });
  vi.stubGlobal("fetch", fetchSession);
  const { rerender } = render(
    <ProtectedWorkspace>
      <h1>Обзор</h1>
    </ProtectedWorkspace>,
  );
  const navigation = screen.getByRole("navigation", {
    name: "Основная навигация",
  });
  expect(screen.queryByText("Загрузка…")).toBeNull();
  await screen.findByText("Алексей");
  pathname = "/transactions";
  rerender(
    <ProtectedWorkspace>
      <h1>Транзакции</h1>
    </ProtectedWorkspace>,
  );
  expect(screen.getByRole("navigation", { name: "Основная навигация" })).toBe(
    navigation,
  );
  expect(
    screen
      .getByRole("link", { name: "Транзакции" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(screen.getByRole("heading", { name: "Транзакции" })).toBeTruthy();
  await waitFor(() => expect(fetchSession).toHaveBeenCalledTimes(1));
});
