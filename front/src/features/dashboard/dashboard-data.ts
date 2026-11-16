import type { Transaction } from "@/features/transactions/types";

export type AccountingMode = "date" | "period";
type Series = { result: number[]; expense: number[] };
const daysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();
const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export function dashboardData(
  items: Transaction[],
  now: Date,
  mode: AccountingMode,
) {
  const current = new Date(now.getFullYear(), now.getMonth(), 1);
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const currentDays = daysInMonth(current.getFullYear(), current.getMonth());
  const previousDays = daysInMonth(previous.getFullYear(), previous.getMonth());
  const day = now.getDate();
  const previousDay = Math.min(day, previousDays);
  const makeSeries = (length: number): Series => ({
    result: Array(length).fill(0),
    expense: Array(length).fill(0),
  });
  const currentSeries = makeSeries(currentDays);
  const previousSeries = makeSeries(previousDays);
  const categories = new Map<
    string,
    {
      name: string;
      emoji: string;
      current: number[];
      previous: number[];
      type: "income" | "expense";
    }
  >();
  for (const item of items) {
    const key = mode === "date" ? item.date.slice(0, 7) : item.period;
    const isCurrent = key === monthKey(current);
    if (!isCurrent && key !== monthKey(previous)) continue;
    const series = isCurrent ? currentSeries : previousSeries;
    const index =
      Math.min(Number(item.date.slice(8, 10)), series.result.length) - 1;
    const amount = Math.round(Number(item.amount) * 100);
    series.result[index] += amount;
    if (amount < 0) series.expense[index] -= amount;
    let category = categories.get(item.categoryId);
    if (!category) {
      category = {
        name: item.category,
        emoji: item.emoji,
        current: Array(currentDays).fill(0),
        previous: Array(previousDays).fill(0),
        type: amount < 0 ? "expense" : "income",
      };
      categories.set(item.categoryId, category);
    }
    (isCurrent ? category.current : category.previous)[index] +=
      Math.abs(amount);
  }
  const cumulative = (values: number[]) => {
    let sum = 0;
    return values.map((value) => (sum += value) / 100);
  };
  const result = cumulative(currentSeries.result);
  const previousResult = cumulative(previousSeries.result);
  const expense = cumulative(currentSeries.expense);
  const previousExpense = cumulative(previousSeries.expense);
  const changes = [...categories.entries()]
    .map(([id, category]) => {
      const currentValues = cumulative(category.current);
      const previousValues = cumulative(category.previous);
      const value = currentValues[day - 1];
      const previousValue = previousValues[previousDay - 1];
      const change = previousValue
        ? ((value - previousValue) / previousValue) * 100
        : null;
      return {
        id,
        ...category,
        currentValues,
        previousValues,
        value,
        previousValue,
        change,
      };
    })
    .filter((item) => item.value !== item.previousValue)
    .sort(
      (a, b) =>
        (b.change === null ? Infinity : Math.abs(b.change)) -
        (a.change === null ? Infinity : Math.abs(a.change)),
    )
    .slice(0, 3);
  return {
    current,
    previous,
    day,
    previousDay,
    currentDays,
    result,
    previousResult,
    expense,
    previousExpense,
    changes,
  };
}
