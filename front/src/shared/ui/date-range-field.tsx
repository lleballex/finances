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
  const [boundary, setBoundary] = useState<"from" | "to">("from");
  const [preview, setPreview] = useState("");
  const previewEnd =
    boundary === "to" && from && !to && preview >= from ? preview : "";
  return (
    <div className="ui-field">
      <span className="ui-label" id={labelId}>
        {label}
      </span>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setPreview("");
        }}
      >
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
          side="bottom"
          align="center"
          sideOffset={8}
        >
          <PopoverTitle className="ui-date-range-title">
            Выберите период
          </PopoverTitle>
          <div className="ui-date-range-bounds">
            {(["from", "to"] as const).map((item) => (
              <button
                type="button"
                className="ui-date-range-bound"
                aria-pressed={boundary === item}
                aria-label={`${item === "from" ? "От" : "До"}: ${(item === "from" ? from : to) ? formatDate(item === "from" ? from : to) : "Не указано"}`}
                key={item}
                onClick={() => {
                  setBoundary(item);
                  setPreview("");
                }}
              >
                <span>{item === "from" ? "От" : "До"}</span>
                <strong>
                  {(item === "from" ? from : to)
                    ? formatDate(item === "from" ? from : to)
                    : "Не указано"}
                </strong>
              </button>
            ))}
          </div>
          <Calendar
            className="ui-calendar"
            locale="ru-RU"
            weekStartsOn={1}
            value={(boundary === "from" ? from : to) || null}
            min={boundary === "to" && from ? from : undefined}
            max={boundary === "from" && to ? to : undefined}
            onValueChange={(value) => {
              if (typeof value !== "string") return;
              onChange(
                boundary === "from" ? value : from,
                boundary === "to" ? value : to,
              );
              setPreview("");
              if (boundary === "from" && !to) setBoundary("to");
            }}
          >
            <CalendarGrid
              className="ui-calendar-grid"
              onMouseLeave={() => setPreview("")}
            >
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
                  <CalendarDay
                    value={cell.date}
                    className="ui-calendar-day"
                    onMouseEnter={() => setPreview(cell.date)}
                    onFocus={() => setPreview(cell.date)}
                    data-boundary={
                      cell.date === from || cell.date === to ? "" : undefined
                    }
                    data-between={
                      from &&
                      (to || previewEnd) &&
                      cell.date > from &&
                      cell.date <= (to || previewEnd) &&
                      cell.date !== to
                        ? ""
                        : undefined
                    }
                  />
                )}
              </CalendarWeeks>
            </CalendarGrid>
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
          </Calendar>
          <div className="ui-date-range-actions">
            <Button
              variant="text"
              onClick={() =>
                onChange(
                  boundary === "from" ? "" : from,
                  boundary === "to" ? "" : to,
                )
              }
            >
              Очистить «{boundary === "from" ? "От" : "До"}»
            </Button>
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
