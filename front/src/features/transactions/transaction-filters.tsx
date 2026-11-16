"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { DateRangeField, TextField } from "@/shared/ui";

export function TransactionFilters({
  query,
  setQuery,
  from,
  setFrom,
  to,
  setTo,
}: {
  query: string;
  setQuery: (value: string) => void;
  from: string;
  setFrom: (value: string) => void;
  to: string;
  setTo: (value: string) => void;
}) {
  return (
    <section
      className="transaction-filter-panel"
      aria-labelledby="filters-heading"
    >
      <div className="transaction-filter-heading">
        <span>
          <SlidersHorizontal size={19} aria-hidden="true" />
        </span>
        <h2 id="filters-heading">Фильтры</h2>
      </div>
      <div className="transaction-filters">
        <TextField
          label="Поиск"
          type="search"
          value={query}
          onValueChange={setQuery}
          placeholder="Найти транзакцию"
          leading={<Search size={17} />}
        />
        <DateRangeField
          label="Период"
          from={from}
          to={to}
          onChange={(start, end) => {
            setFrom(start);
            setTo(end);
          }}
        />
      </div>
    </section>
  );
}
