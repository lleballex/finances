"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  ChartColumnIncreasing,
  ChartNoAxesCombined,
  ChartPie,
  SlidersHorizontal,
} from "lucide-react";
import { api } from "@/shared/api/client";
import { Card, Button, SelectField, DateRangeField } from "@/shared/ui";
import { useAccountingMode } from "@/features/accounting/accounting-mode";
import { CreateTransaction } from "@/features/transactions/create-transaction";
import type {
  Transaction,
  TransactionsResponse,
} from "@/features/transactions/types";
import {
  statisticsData,
  type Category,
  type CategoryTotals,
  type Interval,
  type OperationType,
} from "./statistics-data";
import "./statistics.css";

const money = (cents: number) =>
  `${cents < 0 ? "−" : ""}${(Math.abs(cents) / 100).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`;
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
function Heading({
  icon: Icon,
  children,
}: {
  icon: typeof ChartPie;
  children: React.ReactNode;
}) {
  return (
    <div className="statistics-heading">
      <span>
        <Icon aria-hidden="true" />
      </span>
      <h3>{children}</h3>
    </div>
  );
}
function LineChart({
  keys,
  lines,
  label,
  signed = false,
}: {
  keys: string[];
  lines: { name: string; color: string; values: number[] }[];
  label: string;
  signed?: boolean;
}) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    if (ref.current) {
      observer.observe(ref.current);
      setWidth(ref.current.clientWidth);
    }
    return () => observer.disconnect();
  }, []);
  const values = lines.flatMap((line) => line.values).concat(0),
    max = Math.max(...values),
    min = Math.min(...values),
    span = max - min || 1;
  const right = Math.max(width - 4, 100),
    left = 72;
  const x = (index: number) =>
    keys.length === 1
      ? (left + right) / 2
      : left + (index * (right - left)) / Math.max(keys.length - 1, 1);
  const y = (value: number) => 165 - ((value - min) * 140) / span;
  const show = Math.max(1, Math.ceil(keys.length / 7));
  return (
    <svg
      ref={ref}
      className="statistics-line-chart"
      viewBox={width ? `0 0 ${width} 200` : undefined}
      role="img"
      aria-label={label}
    >
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line
            x1={left}
            x2={right}
            y1={25 + (i * 140) / 3}
            y2={25 + (i * 140) / 3}
          />
          <text x={left - 8} y={29 + (i * 140) / 3} textAnchor="end">
            {(max === min ? 0 : (max - (i * span) / 3) / 100).toLocaleString(
              "ru-RU",
              { maximumFractionDigits: 2 },
            )}
          </text>
        </g>
      ))}
      {lines.map((line) => (
        <g key={line.name}>
          <polyline
            points={line.values
              .map((value, index) => `${x(index)},${y(value)}`)
              .join(" ")}
            stroke={line.color}
          />
          {line.values.map((value, index) => (
            <circle
              key={keys[index]}
              cx={x(index)}
              cy={y(value)}
              r="3.5"
              fill={signed ? (value < 0 ? "#f27b7b" : "#63d39e") : line.color}
            >
              <title>
                {keys[index]}: {money(value)}
              </title>
            </circle>
          ))}
        </g>
      ))}
      {keys.map(
        (key, i) =>
          (i % show === 0 || i === keys.length - 1) && (
            <text key={key} x={x(i)} y="193" textAnchor="middle">
              {key}
            </text>
          ),
      )}
    </svg>
  );
}
type Slice = {
  id: string;
  name: string;
  color: string;
  total: number;
  drill: boolean;
};
function Donut({
  slices,
  onSelect,
  drilled,
}: {
  slices: Slice[];
  onSelect: (slice: Slice) => void;
  drilled: boolean;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.total, 0);
  return (
    <div className="statistics-donut-layout">
      <svg
        className="statistics-donut"
        viewBox="0 0 120 120"
        aria-label={
          drilled
            ? "Распределение подкатегорий; повторное нажатие возвращает категории"
            : "Распределение по категориям"
        }
      >
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="#eeefeb"
          strokeWidth="22"
        />
        {slices.map((slice, index) => {
          const fraction = total ? slice.total / total : 0;
          const start = total
            ? slices
                .slice(0, index)
                .reduce((sum, item) => sum + item.total, 0) / total
            : 0;
          return (
            <circle
              key={slice.id}
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={slice.color}
              strokeWidth="22"
              strokeDasharray={`${fraction * 282.743} 282.743`}
              strokeDashoffset={-start * 282.743}
              transform="rotate(-90 60 60)"
              role="button"
              tabIndex={0}
              aria-label={`${slice.name}: ${money(slice.total)}${slice.drill ? ", показать подкатегории" : drilled ? ", вернуться к категориям" : ""}`}
              onClick={() => onSelect(slice)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(slice);
                }
              }}
            />
          );
        })}
        {drilled && (
          <circle
            cx="60"
            cy="60"
            r="30"
            fill="transparent"
            role="button"
            tabIndex={0}
            aria-label="Вернуться к категориям"
            onClick={() => onSelect(slices[0])}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(slices[0]);
              }
            }}
          />
        )}
      </svg>
      <div className="statistics-distribution">
        {slices.map((slice) => (
          <div key={slice.id}>
            <span>
              <i style={{ background: slice.color }} />
              {slice.name}
            </span>
            <span>
              <strong>{money(slice.total)}</strong>{" "}
              <small>
                {total
                  ? ((slice.total / total) * 100).toLocaleString("ru-RU", {
                      maximumFractionDigits: 1,
                    })
                  : 0}
                %
              </small>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Analysis({
  type,
  entries,
  keys,
  buckets,
  items,
  categories,
}: {
  type: "expense" | "income";
  entries: CategoryTotals[];
  keys: string[];
  buckets: Map<string, { income: number; expense: number }>;
  items: Transaction[];
  categories: Category[];
}) {
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [drill, setDrill] = useState<string | null>(null);
  const selected = entries.filter((entry) => !excluded.has(entry.category.id));
  const parent = categories.find((category) => category.id === drill);
  const children = categories.filter((category) => category.parentId === drill);
  const slices: Slice[] =
    drill && parent
      ? [parent, ...children]
          .map((category) => ({
            id: category.id,
            name: category.id === drill ? "Без подкатегории" : category.name,
            color: category.color,
            total: items
              .filter((item) => item.categoryId === category.id)
              .reduce(
                (sum, item) =>
                  sum + Math.abs(Math.round(Number(item.amount) * 100)),
                0,
              ),
            drill: false,
          }))
          .filter((slice) => slice.total > 0)
      : entries.map((entry) => ({
          id: entry.category.id,
          name: entry.category.name,
          color: entry.category.color,
          total: entry.total,
          drill: categories.some(
            (category) => category.parentId === entry.category.id,
          ),
        }));
  const displayName = type === "expense" ? "Расходы" : "Доходы",
    genitive = type === "expense" ? "расходов" : "доходов";
  return (
    <section className="statistics-analysis">
      <h2>{displayName}</h2>
      <Card className="statistics-panel">
        <Heading icon={type === "expense" ? ArrowDown : ArrowUp}>
          Динамика {genitive}
        </Heading>
        <LineChart
          keys={keys}
          lines={[
            {
              name: displayName,
              color: "#202020",
              values: keys.map((key) => buckets.get(key)?.[type] ?? 0),
            },
          ]}
          label={`Динамика ${genitive}`}
        />
      </Card>
      <Card className="statistics-panel">
        <div className="statistics-panel-header">
          <Heading icon={ChartNoAxesCombined}>Динамика по категориям</Heading>
          <Button
            variant="secondary"
            disabled={!entries.length}
            onClick={() =>
              setExcluded(
                selected.length === entries.length
                  ? new Set(entries.map((entry) => entry.category.id))
                  : new Set(),
              )
            }
          >
            {selected.length === entries.length ? "Снять все" : "Выбрать все"}
          </Button>
        </div>
        <div className="statistics-series">
          {entries.map((entry) => (
            <button
              type="button"
              key={entry.category.id}
              aria-pressed={!excluded.has(entry.category.id)}
              onClick={() =>
                setExcluded((old) => {
                  const next = new Set(old);
                  if (next.has(entry.category.id))
                    next.delete(entry.category.id);
                  else next.add(entry.category.id);
                  return next;
                })
              }
            >
              <i style={{ background: entry.category.color }} />
              {entry.category.name}
            </button>
          ))}
        </div>
        <LineChart
          keys={keys}
          lines={selected.map((entry) => ({
            name: entry.category.name,
            color: entry.category.color,
            values: keys.map((key) => entry.byBucket[key] ?? 0),
          }))}
          label={`Динамика ${genitive} по категориям`}
        />
      </Card>
      <Card className="statistics-panel">
        <Heading icon={ChartPie}>Распределение по категориям</Heading>
        {slices.length || drill ? (
          <Donut
            slices={slices}
            drilled={!!drill}
            onSelect={(slice) => {
              if (drill) setDrill(null);
              else if (slice?.drill) setDrill(slice.id);
            }}
          />
        ) : (
          <p className="statistics-no-data">Нет данных за выбранный период</p>
        )}
      </Card>
    </section>
  );
}
const noTransactions: Transaction[] = [];
const noCategories: Category[] = [];
export function StatisticsPage() {
  const mode = useAccountingMode((state) => state.mode),
    setMode = useAccountingMode((state) => state.setMode);
  const [rangeFrom, setRangeFrom] = useState(""),
    [rangeTo, setRangeTo] = useState(""),
    [interval, setInterval] = useState<Interval>("month"),
    [operation, setOperation] = useState<OperationType>("all");
  const transactions = useQuery({
    queryKey: ["statistics-transactions"],
    queryFn: loadTransactions,
  });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });
  const items = transactions.data ?? noTransactions,
    categoryList = categories.data ?? noCategories;
  const data = useMemo(
    () =>
      statisticsData(
        items,
        categoryList,
        mode,
        rangeFrom,
        rangeTo,
        interval,
        operation,
      ),
    [items, categoryList, mode, rangeFrom, rangeTo, interval, operation],
  );
  const refresh = () => {
    void transactions.refetch();
  };
  const isPending = transactions.isPending || categories.isPending,
    isError = transactions.isError || categories.isError;
  return (
    <div className="statistics-page">
      <header className="statistics-header">
        <h1>Статистика</h1>
      </header>
      {isPending ? (
        <p role="status">Загрузка статистики…</p>
      ) : isError ? (
        <p role="alert">Не удалось загрузить статистику. Обновите страницу.</p>
      ) : !items.length ? (
        <Card>
          <p>Транзакций пока нет</p>
          <CreateTransaction onCreated={refresh} />
        </Card>
      ) : (
        <>
          <aside className="statistics-settings">
            <div className="statistics-settings-heading">
              <span>
                <SlidersHorizontal aria-hidden="true" />
              </span>
              <h2>Параметры</h2>
            </div>
            <SelectField
              label="Режим учёта"
              value={mode}
              options={[
                { value: "date", label: "По датам операций" },
                { value: "period", label: "По учётным периодам" },
              ]}
              onValueChange={(value) => {
                if (!value) return;
                setMode(value as "date" | "period");
                if (value === "period" && interval === "day")
                  setInterval("month");
              }}
            />
            <DateRangeField
              label="Период"
              from={rangeFrom}
              to={rangeTo}
              onChange={(from, to) => {
                setRangeFrom(from);
                setRangeTo(to);
              }}
            />
            <SelectField
              label="Временной разрез"
              value={interval}
              options={[
                { value: "day", label: "По дням", disabled: mode === "period" },
                { value: "month", label: "По месяцам" },
                { value: "year", label: "По годам" },
              ]}
              onValueChange={(value) => value && setInterval(value as Interval)}
            />
            <SelectField
              label="Тип операций"
              value={operation}
              options={[
                { value: "all", label: "Все операции" },
                { value: "regular", label: "Регулярные" },
                { value: "irregular", label: "Нерегулярные" },
              ]}
              onValueChange={(value) =>
                value && setOperation(value as OperationType)
              }
            />
          </aside>
          <div className="statistics-content">
            <div className="statistics-totals">
              <Card tone="lime">
                <small>Общий результат</small>
                <strong
                  className={
                    data.result < 0
                      ? "statistics-negative"
                      : data.result > 0
                        ? "statistics-positive"
                        : ""
                  }
                >
                  {data.result > 0 ? "+" : ""}
                  {money(data.result)}
                </strong>
              </Card>
              <Card>
                <small>Доходы</small>
                <strong>{money(data.income)}</strong>
              </Card>
              <Card>
                <small>Расходы</small>
                <strong>{money(data.expense)}</strong>
              </Card>
            </div>
            <Card tone="dark" className="statistics-panel statistics-result">
              <Heading icon={ChartColumnIncreasing}>
                Динамика результата
              </Heading>
              <LineChart
                keys={data.keys}
                lines={[
                  {
                    name: "Результат",
                    color: "#b5b5b5",
                    values: data.keys.map((key) => {
                      const bucket = data.buckets.get(key);
                      return (bucket?.income ?? 0) - (bucket?.expense ?? 0);
                    }),
                  },
                ]}
                signed
                label="Динамика финансового результата"
              />
            </Card>
            {(["expense", "income"] as const).map((type) => (
              <Analysis
                key={type}
                type={type}
                entries={data.categories.filter(
                  (item) => item.category.type === type,
                )}
                keys={data.keys}
                buckets={data.buckets}
                items={data.items}
                categories={categoryList}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
