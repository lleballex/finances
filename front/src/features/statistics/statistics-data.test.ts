import { describe, expect, it } from "vitest";
import { statisticsData, type Category } from "./statistics-data";
import type { Transaction } from "@/features/transactions/types";
const categories: Category[] = [
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
const item = (
  id: string,
  amount: string,
  regular: boolean,
  date: string,
  period: string,
): Transaction => ({
  id,
  categoryId: id,
  amount,
  regular,
  date,
  period,
  category: id,
  description: null,
  color: "#123456",
  emoji: "🍎",
});
describe("statisticsData", () => {
  const items = [
    item("parent", "-10.25", true, "2025-02-01", "2025-01"),
    item("child", "-5.10", false, "2025-01-05", "2025-01"),
  ];
  it("includes direct and child transactions in parent totals", () => {
    const data = statisticsData(
      items,
      categories,
      "period",
      "2025-01",
      "month",
      "all",
    );
    expect(data.expense).toBe(1535);
    expect(data.categories[0].total).toBe(1535);
  });
  it("filters by actual date and regularity", () => {
    const data = statisticsData(
      items,
      categories,
      "date",
      "2025-01",
      "day",
      "irregular",
    );
    expect(data.expense).toBe(510);
    expect(data.keys).toHaveLength(31);
    expect(data.keys[4]).toBe("2025-01-05");
  });
});
