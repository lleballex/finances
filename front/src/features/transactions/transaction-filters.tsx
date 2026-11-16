"use client";

import { Field, FieldLabel } from "@ui-sdk/react/field";
import { Input } from "@ui-sdk/react/input";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";

const formatDate = (value: string) =>
  value ? value.split("-").reverse().join(".") : "…";
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
        <Field className="transaction-field">
          <FieldLabel>Поиск</FieldLabel>
          <div className="transaction-search">
            <Search size={17} aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onValueChange={setQuery}
              placeholder="Найти транзакцию"
            />
          </div>
        </Field>
        <div className="transaction-field">
          <span id="period-label">Период</span>
          <Popover>
            <PopoverTrigger
              className="transaction-period-trigger"
              aria-labelledby="period-label period-value"
            >
              <span id="period-value">
                {from || to
                  ? `${formatDate(from)} — ${formatDate(to)}`
                  : "Всё время"}
              </span>
              <ChevronDown size={16} aria-hidden="true" />
            </PopoverTrigger>
            <PopoverContent className="transaction-period-popup">
              <PopoverTitle className="transaction-period-title">
                Выберите период
              </PopoverTitle>
              <Field className="transaction-field">
                <FieldLabel>С</FieldLabel>
                <Input
                  type="date"
                  value={from}
                  onValueChange={setFrom}
                  max={to || undefined}
                  className="transaction-date-input"
                />
              </Field>
              <Field className="transaction-field">
                <FieldLabel>По</FieldLabel>
                <Input
                  type="date"
                  value={to}
                  onValueChange={setTo}
                  min={from || undefined}
                  className="transaction-date-input"
                />
              </Field>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </section>
  );
}
