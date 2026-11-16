"use client";

import { useId, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export function MonthField({
  label,
  value,
  onChange,
  error,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const labelId = useId();
  const valueId = useId();
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(
    () => Number(value.slice(0, 4)) || new Date().getFullYear(),
  );
  const month = Number(value.slice(5, 7));
  const formatted =
    month >= 1 && month <= 12
      ? `${months[month - 1]} ${value.slice(0, 4)}`
      : "Выберите месяц";

  return (
    <div className="ui-field">
      <span className="ui-label" id={labelId}>
        {label}
      </span>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next)
            setYear(Number(value.slice(0, 4)) || new Date().getFullYear());
          setOpen(next);
        }}
      >
        <PopoverTrigger
          className="ui-input ui-select-trigger"
          aria-labelledby={`${labelId} ${valueId}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
        >
          <span id={valueId}>{formatted}</span>
          <CalendarDays size={18} aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          className="ui-date-range-popup ui-month-popup"
          side="bottom"
          align="center"
          sideOffset={8}
        >
          <PopoverTitle className="ui-date-range-title">
            Выберите месяц
          </PopoverTitle>
          <div className="ui-calendar-header ui-month-header">
            <Button
              variant="icon"
              className="ui-calendar-nav"
              aria-label="Предыдущий год"
              disabled={year <= 1}
              onClick={() => setYear(year - 1)}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </Button>
            <strong aria-live="polite">{year}</strong>
            <Button
              variant="icon"
              className="ui-calendar-nav"
              aria-label="Следующий год"
              disabled={year >= 9999}
              onClick={() => setYear(year + 1)}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </Button>
          </div>
          <div className="ui-month-grid" aria-label={`Месяцы ${year} года`}>
            {months.map((name, index) => {
              const item = `${String(year).padStart(4, "0")}-${String(index + 1).padStart(2, "0")}`;
              return (
                <Button
                  key={name}
                  variant="text"
                  className="ui-month-option"
                  aria-pressed={item === value}
                  onClick={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  {name}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      {error && (
        <p className="ui-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
