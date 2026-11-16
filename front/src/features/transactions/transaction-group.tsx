"use client";

import { ChevronDown, Repeat2 } from "lucide-react";
import { ActionMenu, CollapsibleSection } from "@/shared/ui";
import type { Transaction } from "./types";

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const monthFormat = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
export const dateLabel = (date: string) =>
  dateFormat.format(new Date(`${date}T00:00:00Z`));
const monthLabel = (month: string) =>
  monthFormat.format(new Date(`${month}-01T00:00:00Z`));
const money = (amount: number) =>
  `${amount > 0 ? "+" : amount < 0 ? "−" : ""}${Math.abs(amount).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ₽`;

export function TransactionGroup({
  groupKey,
  items,
  open,
  onOpenChange,
  total,
}: {
  groupKey: string;
  items: Transaction[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: string;
}) {
  const totalAmount = Number(total);
  return (
    <CollapsibleSection
      open={open}
      onOpenChange={onOpenChange}
      className="transaction-group"
      headingClassName="transaction-group-heading"
      panelClassName="transaction-rows"
      heading={
        <>
          <ChevronDown
            size={18}
            className="transaction-chevron"
            aria-hidden="true"
          />
          <strong>
            {groupKey.length === 7 ? monthLabel(groupKey) : dateLabel(groupKey)}
          </strong>
          <span
            className={totalAmount > 0 ? "transaction-positive" : undefined}
          >
            {money(totalAmount)}
          </span>
        </>
      }
    >
      {items.map((item) => (
        <div
          className={`transaction-row${item.regular ? " is-regular" : ""}`}
          key={item.id}
        >
          <span
            className="transaction-category-icon"
            style={{ background: item.color }}
            aria-hidden="true"
          >
            {item.emoji}
          </span>
          <div className="transaction-row-main">
            <strong>
              {item.category}
              {item.regular && (
                <span
                  className="transaction-repeat"
                  aria-label="Регулярная транзакция"
                  title="Регулярная транзакция"
                >
                  <Repeat2 size={12} aria-hidden="true" />
                </span>
              )}
            </strong>
            <small>
              {dateLabel(item.date)}{" "}
              {item.period !== item.date.slice(0, 7) && (
                <span
                  className="transaction-period"
                  aria-label={`Учётный период: ${monthLabel(item.period)}`}
                >
                  {monthLabel(item.period)}
                </span>
              )}
            </small>
          </div>
          <strong
            className={`transaction-amount${Number(item.amount) > 0 ? " transaction-positive" : ""}`}
          >
            {money(Number(item.amount))}
          </strong>
          <ActionMenu
            label={`Действия с транзакцией ${item.category} от ${dateLabel(item.date)}`}
            options={[
              { value: "edit", label: "Изменить", disabled: true },
              { value: "delete", label: "Удалить", disabled: true },
            ]}
          />
        </div>
      ))}
    </CollapsibleSection>
  );
}
