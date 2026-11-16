import { render, screen } from "@testing-library/react";
import { createAgent } from "@ui-sdk/react/agent";
import { expect, test } from "vitest";
import Home from "../app/page";

test("стартовая страница сообщает о недоступности входа", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { name: "Могну" })).toBeTruthy();
  const button = screen.getByRole("button", { name: "Войти через Яндекс ID" });
  expect(button.hasAttribute("disabled")).toBe(true);
  expect(screen.getByText("Вход пока недоступен")).toBeTruthy();
  const entry = createAgent()
    .snapshot()
    .find((item) => item.label === "Войти через Яндекс ID");
  expect(entry).toBeTruthy();
});
