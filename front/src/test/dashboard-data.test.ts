import { describe, expect, it } from "vitest";
import { dashboardData } from "@/features/dashboard/dashboard-data";
import type { Transaction } from "@/features/transactions/types";

function transaction(
  date: string,
  period: string,
  amount: string,
  categoryId = "a",
): Transaction {
  return {
    id: date,
    categoryId,
    category: categoryId,
    description: null,
    date,
    period,
    amount,
    emoji: "💰",
    color: "#ffffff",
    regular: false,
  };
}

describe("dashboard calculations", () => {
  it("compares calendar months and clamps accounting dates to the last day", () => {
    const data = dashboardData(
      [
        transaction("2024-03-31", "2024-02", "100.10"),
        transaction("2024-02-10", "2024-02", "-20.05"),
      ],
      new Date(2024, 2, 31),
      "period",
    );
    expect(data.previousDay).toBe(29);
    expect(data.previousResult[27]).toBe(-20.05);
    expect(data.previousResult[28]).toBe(80.05);
  });
  it("ranks new categories and compares the same part of the previous month", () => {
    const data = dashboardData(
      [
        transaction("2024-03-10", "2024-03", "-50", "new"),
        transaction("2024-02-10", "2024-02", "-100", "old"),
        transaction("2024-03-11", "2024-03", "-150", "old"),
        transaction("2024-02-20", "2024-02", "-1000", "old"),
      ],
      new Date(2024, 2, 15),
      "date",
    );
    expect(data.changes.map((item) => item.id)).toEqual(["new", "old"]);
    expect(data.changes[0].change).toBeNull();
    expect(data.changes[1].change).toBe(50);
    expect(data.previousExpense[14]).toBe(100);
    expect(data.previousExpense.at(-1)).toBe(1100);
  });
});
