"use client";
import { useQuery } from "@tanstack/react-query";
import {
  ChartNoAxesCombined,
  Clock3,
  ChartColumnIncreasing,
} from "lucide-react";
import { api } from "@/shared/api/client";
import { Card } from "@/shared/ui";
import { CreateTransaction } from "@/features/transactions/create-transaction";
import type {
  Transaction,
  TransactionsResponse,
} from "@/features/transactions/types";
import { dashboardData } from "./dashboard-data";
import "./dashboard.css";
const money = (v: number) =>
  `${v < 0 ? "−" : ""}${Math.abs(v).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`;
const month = (d: Date) =>
  new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(d);
const range = (day: number, d: Date) =>
  `1–${day} ${new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(d).replace(/^1\s*/, "")}`;
function ComparisonChange({
  current,
  previous,
  lowerIsBetter = false,
}: {
  current: number;
  previous: number;
  lowerIsBetter?: boolean;
}) {
  if (!previous || current === previous) return null;
  const change = ((current - previous) / Math.abs(previous)) * 100;
  const favorable = lowerIsBetter ? change < 0 : change > 0;
  return (
    <span
      className={`dashboard-comparison-change ${favorable ? "positive" : "negative"}`}
      aria-label={`На ${Math.abs(change).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}% ${change > 0 ? "больше" : "меньше"}, чем за сопоставимый период предыдущего месяца`}
    >
      {change > 0 ? "↑" : "↓"}{" "}
      {Math.abs(change).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%
    </span>
  );
}
async function loadTransactions() {
  const items: Transaction[] = [];
  let page = 1,
    total = 0;
  do {
    const { data } = await api.get<TransactionsResponse>("/transactions", {
      params: { page, limit: 100 },
    });
    items.push(...data.data);
    total = data.meta.total;
    page++;
    if (!data.data.length) break;
  } while (items.length < total);
  return items;
}
function Chart({
  current,
  previous,
  day,
  names,
  label,
  compact = false,
}: {
  current: number[];
  previous: number[];
  day: number;
  names: string[];
  label: string;
  compact?: boolean;
}) {
  const visible = current.slice(0, day),
    values = [...visible, ...previous, 0];
  const min = Math.min(...values),
    max = Math.max(...values),
    span = max - min || 1,
    width = Math.max(current.length, previous.length);
  const left = compact ? 48 : 65,
    right = compact ? 482 : 930;
  const x = (i: number) => left + (i * (right - left)) / (width - 1),
    y = (v: number) => 190 - ((v - min) / span) * 160;
  const points = (arr: number[]) =>
    arr.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  return (
    <>
      <div className="dashboard-legend">
        <span>
          <i />
          {names[0]}
        </span>
        <span>
          <i className="previous" />
          {names[1]}
        </span>
      </div>
      <svg
        className="dashboard-chart"
        viewBox={compact ? "0 0 500 225" : "0 0 960 225"}
        preserveAspectRatio={compact ? "none" : "xMidYMid meet"}
        role="img"
        aria-label={label}
      >
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <line
              x1={left}
              x2={right}
              y1={30 + (i * 160) / 3}
              y2={30 + (i * 160) / 3}
            />
            <text x={left - 10} y={34 + (i * 160) / 3} textAnchor="end">
              {Math.round(max - (i * span) / 3).toLocaleString("ru-RU")}
            </text>
          </g>
        ))}
        <polyline className="previous-line" points={points(previous)} />
        <polyline className="current-line" points={points(visible)} />
        <circle cx={x(visible.length - 1)} cy={y(visible.at(-1) ?? 0)} r="5" />
        {[1, 5, 10, 15, 20, 25, width]
          .filter((v, i, a) => v <= width && a.indexOf(v) === i)
          .map((v) => (
            <text key={v} x={x(v - 1)} y="218" textAnchor="middle">
              {v}
            </text>
          ))}
      </svg>
    </>
  );
}
export function DashboardPage() {
  const query = useQuery({
    queryKey: ["dashboard-transactions"],
    queryFn: loadTransactions,
  });
  const data = query.data
    ? dashboardData(query.data, new Date(), "date")
    : null;
  const refresh = () => {
    void query.refetch();
  };
  const names = data ? [month(data.current), month(data.previous)] : [];
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-title">
          <h1>Обзор</h1>
          {data && query.data?.length ? (
            <span className="dashboard-period">
              {range(data.day, data.current)}
            </span>
          ) : null}
        </div>
        {query.data?.length ? <CreateTransaction onCreated={refresh} /> : null}
      </header>
      {query.isPending ? (
        <p role="status">Загрузка обзора…</p>
      ) : query.isError ? (
        <p role="alert">Не удалось загрузить обзор. Обновите страницу.</p>
      ) : !query.data?.length ? (
        <Card className="dashboard-empty">
          <p>Транзакций пока нет</p>
          <CreateTransaction onCreated={refresh} />
        </Card>
      ) : (
        data && (
          <div className="dashboard-grid">
            <Card tone="lime" className="dashboard-summary">
              <h2>
                <span>
                  <ChartColumnIncreasing />
                </span>
                Общий результат
              </h2>
              <div className="dashboard-total">
                <div
                  className={`dashboard-value ${data.result[data.day - 1] < 0 ? "negative" : "positive"}`}
                >
                  {money(data.result[data.day - 1])}
                </div>
                <ComparisonChange
                  current={data.result[data.day - 1]}
                  previous={data.previousResult[data.previousDay - 1]}
                />
              </div>
              <div className="dashboard-comparison">
                <div>
                  <small>{range(data.previousDay, data.previous)}</small>
                  <strong>
                    {money(data.previousResult[data.previousDay - 1])}
                  </strong>
                </div>
                <div>
                  <small>Весь {names[1]}</small>
                  <strong>{money(data.previousResult.at(-1) ?? 0)}</strong>
                </div>
              </div>
            </Card>
            <Card className="dashboard-summary">
              <h2>
                <span>
                  <Clock3 />
                </span>
                Темп трат
              </h2>
              <div className="dashboard-total">
                <div className="dashboard-pace">
                  {money(data.expense[data.day - 1] / data.day)} / день
                </div>
                <ComparisonChange
                  current={data.expense[data.day - 1] / data.day}
                  previous={
                    data.previousExpense[data.previousDay - 1] /
                    data.previousDay
                  }
                  lowerIsBetter
                />
              </div>
              <p className="dashboard-muted">
                Прогноз за месяц:{" "}
                {money(
                  (data.expense[data.day - 1] / data.day) * data.currentDays,
                )}
              </p>
              <div className="dashboard-comparison">
                <div>
                  <small>{range(data.previousDay, data.previous)}</small>
                  <strong>
                    {money(
                      data.previousExpense[data.previousDay - 1] /
                        data.previousDay,
                    )}{" "}
                    / день
                  </strong>
                </div>
                <div>
                  <small>Весь {names[1]}</small>
                  <strong>
                    {money(
                      (data.previousExpense.at(-1) ?? 0) /
                        data.previousExpense.length,
                    )}{" "}
                    / день
                  </strong>
                </div>
              </div>
            </Card>
            <Card tone="dark" className="dashboard-wide dashboard-main-chart">
              <h2>
                <span>
                  <ChartNoAxesCombined />
                </span>
                Динамика по дням
              </h2>
              <Chart
                current={data.result}
                previous={data.previousResult}
                day={data.day}
                names={names}
                label="Накопленный финансовый результат по дням"
              />
            </Card>
            <h2 className="dashboard-section-title">Изменения в категориях</h2>
            {data.changes.length ? (
              data.changes.map((change, index) => (
                <Card
                  key={change.id}
                  tone={index === 1 ? "dark" : "light"}
                  className={`dashboard-wide dashboard-category ${index === 1 ? "reverse" : ""}`}
                >
                  <div className="dashboard-category-chart">
                    <h2>{change.name}</h2>
                    <Chart
                      compact
                      current={change.currentValues}
                      previous={change.previousValues}
                      day={data.day}
                      names={names}
                      label={`${change.name}: накопленная сумма по дням`}
                    />
                  </div>
                  <div className="dashboard-category-summary">
                    <div className="dashboard-highlight">
                      <div
                        className={`dashboard-change ${change.value > change.previousValue === (change.type === "income") ? "positive" : "negative"}`}
                      >
                        {change.change === null
                          ? "Новое"
                          : `${change.change > 0 ? "+" : "−"}${Math.abs(change.change).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`}
                      </div>
                      <span
                        className="dashboard-category-emoji"
                        style={{ backgroundColor: change.color }}
                        aria-hidden="true"
                      >
                        {change.emoji}
                      </span>
                    </div>
                    <p className="dashboard-muted">
                      {change.type === "income" ? "Доход" : "Расход"}{" "}
                      {change.value > change.previousValue
                        ? "вырос"
                        : "сократился"}{" "}
                      с {money(change.previousValue)} до {money(change.value)}{" "}
                      за {range(data.day, data.current)} по сравнению с{" "}
                      {range(data.previousDay, data.previous)}
                    </p>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="dashboard-wide">
                <p>Изменений за сопоставимые периоды нет.</p>
              </Card>
            )}
          </div>
        )
      )}
    </div>
  );
}
