import { render, screen } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test, vi } from "vitest";
import Home from "../app/page";

test("страница предлагает вход через Яндекс ID", () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 401 }));
  render(<Home />);
  expect(screen.getByRole("heading", { name: "Могну" })).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Войти через Яндекс ID" })
      .hasAttribute("disabled"),
  ).toBe(false);
  expect(
    createAgent()
      .snapshot()
      .some((item) => item.label === "Войти через Яндекс ID"),
  ).toBe(true);
});
