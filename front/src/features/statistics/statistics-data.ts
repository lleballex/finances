import type { Transaction } from "@/features/transactions/types";
import type { AccountingMode } from "@/features/dashboard/dashboard-data";

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  emoji: string;
  parentId: string | null;
};
export type Interval = "day" | "month" | "year";
export type OperationType = "all" | "regular" | "irregular";
export type CategoryTotals = {
  category: Category;
  total: number;
  byBucket: Record<string, number>;
};

export function statisticsData(
  items: Transaction[],
  categories: Category[],
  mode: AccountingMode,
  period: string,
  interval: Interval,
  operation: OperationType,
) {
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const buckets = new Map<string, { income: number; expense: number }>();
  const totals = new Map<string, CategoryTotals>();
  let income = 0,
    expense = 0;
  for (const item of items) {
    const date = mode === "period" ? item.period : item.date;
    if (period !== "all" && date.slice(0, 7) !== period) continue;
    if (operation !== "all" && item.regular !== (operation === "regular"))
      continue;
    const bucket =
      interval === "year"
        ? date.slice(0, 4)
        : interval === "month"
          ? date.slice(0, 7)
          : date;
    const amount = Math.round(Number(item.amount) * 100);
    const value = Math.abs(amount);
    if (amount < 0) expense += value;
    else income += value;
    const entry = buckets.get(bucket) ?? { income: 0, expense: 0 };
    if (amount < 0) entry.expense += value;
    else entry.income += value;
    buckets.set(bucket, entry);
    const category = categoryById.get(item.categoryId);
    if (!category) continue;
    const parent = category.parentId
      ? categoryById.get(category.parentId)
      : category;
    if (!parent) continue;
    const aggregate = totals.get(parent.id) ?? {
      category: parent,
      total: 0,
      byBucket: {},
    };
    aggregate.total += value;
    aggregate.byBucket[bucket] = (aggregate.byBucket[bucket] ?? 0) + value;
    totals.set(parent.id, aggregate);
  }
  const observed = [...buckets.keys()].sort();
  const keys: string[] = [];
  if (observed.length) {
    const first =
      period !== "all" && interval === "day" ? `${period}-01` : observed[0];
    const last =
      period !== "all" && interval === "day"
        ? new Date(
            Date.UTC(Number(period.slice(0, 4)), Number(period.slice(5, 7)), 0),
          )
            .toISOString()
            .slice(0, 10)
        : observed[observed.length - 1];
    const cursor = new Date(
      `${first}${interval === "year" ? "-01-01" : interval === "month" ? "-01" : ""}T00:00:00Z`,
    );
    while (true) {
      const key = cursor
        .toISOString()
        .slice(0, interval === "year" ? 4 : interval === "month" ? 7 : 10);
      if (key > last) break;
      keys.push(key);
      if (interval === "year")
        cursor.setUTCFullYear(cursor.getUTCFullYear() + 1);
      else if (interval === "month")
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      else cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }
  return {
    income,
    expense,
    result: income - expense,
    keys,
    buckets,
    categories: [...totals.values()].sort((a, b) => b.total - a.total),
    items: items.filter((item) => {
      const date = mode === "period" ? item.period : item.date;
      return (
        (period === "all" || date.slice(0, 7) === period) &&
        (operation === "all" || item.regular === (operation === "regular"))
      );
    }),
  };
}
