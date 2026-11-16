"use client";

import { useState } from "react";
import {
  CollapsibleSection,
  DateField,
  DateRangeField,
  Modal,
  MonthField,
  EmojiField,
} from "@/shared/ui";

export function DateExample() {
  const [date, setDate] = useState("");
  return <DateField label="Дата" value={date} onChange={setDate} />;
}

export function DateRangeExample() {
  const [range, setRange] = useState<[string, string]>(["", ""]);
  return (
    <DateRangeField
      label="Период"
      from={range[0]}
      to={range[1]}
      onChange={(from, to) => setRange([from, to])}
    />
  );
}

export function MonthExample() {
  const [month, setMonth] = useState("2026-11");
  return (
    <>
      <MonthField label="Учётный месяц" value={month} onChange={setMonth} />
      <MonthField
        label="Недоступный месяц"
        value={month}
        onChange={setMonth}
        disabled
      />
      <MonthField
        label="Месяц с ошибкой"
        value=""
        onChange={() => {}}
        error="Выберите месяц"
      />
    </>
  );
}

export function SharedComponentsExample() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="stack">
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Пример формы"
        trigger="Открыть форму"
      >
        <p>Содержимое модального окна.</p>
      </Modal>
      <CollapsibleSection
        open={expanded}
        onOpenChange={setExpanded}
        heading={expanded ? "Свернуть содержимое" : "Показать содержимое"}
        headingClassName="ui-button ui-button--secondary"
      >
        <p>Содержимое раскрывающегося раздела.</p>
      </CollapsibleSection>
    </div>
  );
}

export function EmojiExample() {
  const [value, setValue] = useState("");
  return <EmojiField label="Эмодзи" value={value} onValueChange={setValue} />;
}
