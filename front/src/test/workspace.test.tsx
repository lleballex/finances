import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import {
  isWorkspaceSection,
  WorkspaceShell,
} from "../features/workspace/workspace-shell";

test("навигация показывает текущий раздел и ссылки на остальные разделы", () => {
  render(
    <WorkspaceShell section="transactions">
      <h1>Транзакции</h1>
    </WorkspaceShell>,
  );
  expect(
    screen
      .getByRole("link", { name: "Транзакции" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(
    screen.getByRole("link", { name: "Категории" }).getAttribute("href"),
  ).toBe("/preview/categories");
  expect(isWorkspaceSection("invalid")).toBe(false);
});
