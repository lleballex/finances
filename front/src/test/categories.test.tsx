import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { Providers } from "../app/providers";
import { CategoriesPage } from "../features/categories/categories-page";
import { api } from "../shared/api/client";

afterEach(() => vi.restoreAllMocks());
const category = {
  id: "one",
  name: "Продукты",
  type: "expense",
  emoji: "🥑",
  color: "#dce9c8",
  isRegular: true,
  parentId: null,
};
test("пустое состояние позволяет открыть форму", async () => {
  vi.spyOn(api, "get").mockResolvedValue({ data: [] });
  render(
    <Providers>
      <CategoriesPage />
    </Providers>,
  );
  expect(await screen.findByText("Категорий пока нет")).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "Доходы" })).toBeNull();
  const buttons = screen.getAllByRole("button", { name: "Добавить категорию" });
  await userEvent.click(buttons[1]);
  expect(
    screen.getByRole("dialog", { name: "Добавить категорию" }),
  ).toBeTruthy();
});
test("редактирование и удаление категории обращаются к API", async () => {
  vi.spyOn(api, "get").mockResolvedValue({ data: [category] });
  const put = vi.spyOn(api, "put").mockResolvedValue({ data: {} });
  const remove = vi.spyOn(api, "delete").mockResolvedValue({ data: {} });
  const user = userEvent.setup();
  render(
    <Providers>
      <CategoriesPage />
    </Providers>,
  );
  await user.click(
    await screen.findByRole("button", { name: "Действия: Продукты" }),
  );
  expect(screen.queryByRole("heading", { name: "Доходы" })).toBeNull();
  await user.click(await screen.findByRole("menuitem", { name: "Изменить" }));
  await user.clear(screen.getByRole("textbox", { name: "Название" }));
  await user.type(screen.getByRole("textbox", { name: "Название" }), "Еда");
  await user.click(screen.getByRole("button", { name: "Сохранить" }));
  await waitFor(() =>
    expect(put).toHaveBeenCalledWith(
      "/categories/one",
      expect.objectContaining({ name: "Еда" }),
    ),
  );
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await user.click(screen.getByRole("button", { name: "Действия: Продукты" }));
  await user.click(await screen.findByRole("menuitem", { name: "Удалить" }));
  await user.click(screen.getByRole("button", { name: "Удалить" }));
  await waitFor(() => expect(remove).toHaveBeenCalledWith("/categories/one"));
});
