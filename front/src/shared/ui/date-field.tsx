"use client";
import {
  CalendarDay,
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  CalendarWeekday,
  CalendarWeekdays,
  CalendarWeeks,
  DatePicker,
  DatePickerContent,
  DatePickerInput,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ui-field">
      <span className="ui-label">{label}</span>
      <DatePicker
        locale="ru-RU"
        value={value || null}
        onValueChange={(date) => onChange(typeof date === "string" ? date : "")}
      >
        <div className="ui-date-field">
          <DatePickerInput className="ui-input" aria-label={label} />
          <DatePickerTrigger
            className="ui-date-trigger"
            aria-label={`Открыть календарь: ${label}`}
          >
            <CalendarDays size={18} aria-hidden="true" />
          </DatePickerTrigger>
        </div>
        <DatePickerContent
          className="ui-date-range-popup"
          side="bottom"
          align="center"
        >
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
        </DatePickerContent>
      </DatePicker>
    </div>
  );
}
