"use client";

import { useId, useState } from "react";
import {
  Calendar,
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
} from "@ui-sdk/react/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

const formatDate = (value: string) =>
  value ? value.split("-").reverse().join(".") : "…";

export function DateRangeField({
  label,
  from,
  to,
  onChange,
}: {
  label: string;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const labelId = useId();
  const valueId = useId();
  const [open, setOpen] = useState(false);
  return (
    <div className="ui-field">
      <span className="ui-label" id={labelId}>
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className="ui-input ui-select-trigger ui-date-range-trigger"
          aria-labelledby={`${labelId} ${valueId}`}
        >
          <span id={valueId}>
            {from || to
              ? `${formatDate(from)} — ${formatDate(to)}`
              : "Всё время"}
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </PopoverTrigger>
        <PopoverContent
          className="ui-date-range-popup"
          side="left"
          align="end"
          sideOffset={8}
        >
          <PopoverTitle className="ui-date-range-title">
            Выберите период
          </PopoverTitle>
          <Calendar
            className="ui-calendar"
            mode="range"
            locale="ru-RU"
            weekStartsOn={1}
            value={from && to ? [from, to] : null}
            onValueChange={(value) => {
              if (
                Array.isArray(value) &&
                value.length === 2 &&
                value[0] &&
                value[1]
              ) {
                onChange(value[0], value[1]);
                setOpen(false);
              }
            }}
          >
            <div className="ui-calendar-header">
              <CalendarPrevious
                className="ui-calendar-nav"
                aria-label="Предыдущий месяц"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </CalendarPrevious>
              <CalendarHeading className="ui-calendar-heading" />
              <CalendarNext
                className="ui-calendar-nav"
                aria-label="Следующий месяц"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </CalendarNext>
            </div>
            <CalendarGrid className="ui-calendar-grid">
              <CalendarWeekdays>
                {(index) => (
                  <CalendarWeekday
                    index={index}
                    className="ui-calendar-weekday"
                  />
                )}
              </CalendarWeekdays>
              <CalendarWeeks>
                {(cell) => (
                  <CalendarDay value={cell.date} className="ui-calendar-day" />
                )}
              </CalendarWeeks>
            </CalendarGrid>
          </Calendar>
          <Button
            variant="text"
            className="ui-date-range-clear"
            onClick={() => {
              onChange("", "");
              setOpen(false);
            }}
          >
            За всё время
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
