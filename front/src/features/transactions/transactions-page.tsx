"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, LoaderCircle } from "lucide-react";
import { Button, SegmentedControl } from "@/shared/ui";
import { API_URL } from "@/features/auth/session";
import type { Transaction, TransactionsResponse } from "./types";
import { CreateTransaction } from "./create-transaction";
import { TransactionFilters } from "./transaction-filters";
import { TransactionGroup } from "./transaction-group";
import "./transactions.css";

const groupingOptions = [
  { value: "day", label: "По дням" },
  { value: "month", label: "По месяцам" },
];

export function TransactionsPage() {
  const [grouping, setGrouping] = useState("day");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const sentinel = useRef<HTMLDivElement>(null);
  const requestController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    requestController.current = controller;
    const params = new URLSearchParams({ grouping, page: "1" });
    if (query.trim()) params.set("search", query.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const timer = setTimeout(
      () => {
        setItems([]);
        setTotals({});
        setPage(1);
        setTotal(0);
        setLoading(true);
        setError(false);
        fetch(`${API_URL}/transactions?${params}`, {
          credentials: "include",
          signal: controller.signal,
        })
          .then(async (response) => {
            if (!response.ok) throw new Error();
            return response.json() as Promise<TransactionsResponse>;
          })
          .then((result) => {
            setItems(result.data);
            setTotals(result.groupTotals);
            setTotal(result.meta.total);
            setLoading(false);
          })
          .catch(() => {
            if (!controller.signal.aborted) {
              setError(true);
              setLoading(false);
            }
          });
      },
      query ? 250 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [grouping, query, from, to, revision]);

  useEffect(() => {
    const target = sentinel.current;
    if (!target || loading || error || items.length >= total) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      const controller = requestController.current;
      if (!controller) return;
      setLoading(true);
      const params = new URLSearchParams({ grouping, page: String(page + 1) });
      if (query.trim()) params.set("search", query.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      fetch(`${API_URL}/transactions?${params}`, {
        credentials: "include",
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error();
          return response.json() as Promise<TransactionsResponse>;
        })
        .then((result) => {
          if (controller.signal.aborted) return;
          setItems((current) => [...current, ...result.data]);
          setTotals(result.groupTotals);
          setTotal(result.meta.total);
          setPage(result.meta.page);
          setLoading(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setError(true);
            setLoading(false);
          }
        });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [items.length, total, loading, error, page, grouping, query, from, to]);

  const groups = useMemo(() => {
    const grouped = new Map<string, Transaction[]>();
    for (const item of items) {
      const key = grouping === "day" ? item.date : item.date.slice(0, 7);
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }
    return [...grouped];
  }, [items, grouping]);
  const allClosed =
    groups.length > 0 && groups.every(([key]) => closed.has(key));
  const toggleAll = () =>
    setClosed((previous) => {
      const next = new Set(previous);
      groups.forEach(([key]) => (allClosed ? next.delete(key) : next.add(key)));
      return next;
    });
  return (
    <div className="transactions-page">
      <header className="transactions-header">
        <h1>Транзакции</h1>
      </header>
      <section className="transactions-list" aria-label="Список транзакций">
        <div className="transactions-toolbar">
          <SegmentedControl
            label="Группировка"
            options={groupingOptions}
            value={grouping}
            onValueChange={(value) => {
              if (value) {
                setGrouping(value);
                setClosed(new Set());
              }
            }}
          />
          <Button
            variant="text"
            className="transactions-toggle"
            disabled={!groups.length}
            onClick={toggleAll}
          >
            {allClosed ? "Раскрыть все" : "Свернуть все"}{" "}
            {allClosed ? <ArrowDown size={15} /> : <ArrowUp size={15} />}
          </Button>
        </div>
        {groups.map(([key, group]) => (
          <TransactionGroup
            key={key}
            groupKey={key}
            items={group}
            total={totals[key] ?? "0"}
            open={!closed.has(key)}
            onOpenChange={(open) =>
              setClosed((previous) => {
                const next = new Set(previous);
                if (open) next.delete(key);
                else next.add(key);
                return next;
              })
            }
          />
        ))}
        {error ? (
          <p className="transactions-empty">
            Не удалось загрузить транзакции. Обновите страницу.
          </p>
        ) : !loading && !items.length ? (
          <p className="transactions-empty">Транзакции не найдены</p>
        ) : null}
        {loading && (
          <div
            className="transactions-loading"
            role="status"
            aria-label="Загрузка транзакций"
          >
            <LoaderCircle size={24} aria-hidden="true" />
          </div>
        )}
        <div ref={sentinel} />
      </section>
      <aside className="transactions-aside">
        <CreateTransaction
          onCreated={() => setRevision((value) => value + 1)}
        />
        <TransactionFilters
          query={query}
          setQuery={setQuery}
          from={from}
          setFrom={setFrom}
          to={to}
          setTo={setTo}
        />
      </aside>
    </div>
  );
}
