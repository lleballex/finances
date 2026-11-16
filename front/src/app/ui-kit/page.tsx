import Image from "next/image";
import {
  DateExample,
  DateRangeExample,
  MonthExample,
  SharedComponentsExample,
} from "./date-range-example";
import {
  ArrowUpRight,
  CircleHelp,
  LayoutGrid,
  MousePointer2,
  Palette,
  Plus,
  SlidersHorizontal,
  SquareStack,
} from "lucide-react";
import {
  ActionMenu,
  Button,
  Card,
  CheckControl,
  ConfirmDialog,
  SegmentedControl,
  SelectField,
  SwitchControl,
  TextField,
} from "@/shared/ui";

const sections = [
  { href: "#controls", label: "Элементы управления", icon: MousePointer2 },
  { href: "#forms", label: "Поля и выбор", icon: SlidersHorizontal },
  { href: "#surfaces", label: "Карточки", icon: SquareStack },
  { href: "#palette", label: "Цвет и типографика", icon: Palette },
];
const colors = [
  ["Текст", "#171717"],
  ["Вторичный", "#6B6D72"],
  ["Светлый", "#FAFAF8"],
  ["Нейтральный", "#EEEFEB"],
  ["Тёмный", "#202020"],
  ["Лайм", "#DDF45A"],
  ["Плюс", "#10764C"],
  ["Минус", "#BD3434"],
];
const options = [
  { value: "all", label: "Все" },
  { value: "expenses", label: "Расходы" },
  { value: "income", label: "Доходы" },
];

export default function Home() {
  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#top">
          <Image src="/logo.png" alt="" width={34} height={34} /> Финансы
        </a>
        <nav className="nav" aria-label="Разделы UI-kit">
          <a className="active" href="#top">
            <LayoutGrid size={19} /> UI-kit
          </a>
          {sections.map(({ href, label, icon: Icon }) => (
            <a href={href} key={href}>
              <Icon size={19} />
              {label}
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          Единый набор элементов
          <br />
          для будущего приложения
        </div>
      </aside>
      <main className="content" id="top">
        <header className="page-header">
          <p className="eyebrow">ФИНАНСЫ / ДИЗАЙН-СИСТЕМА</p>
          <h1>UI-kit</h1>
          <p className="intro">
            Общие компоненты и их состояния. Попробуйте навести, выбрать и
            управлять ими с клавиатуры.
          </p>
        </header>
        <section className="section" id="controls">
          <div className="section-header">
            <h2>Элементы управления</h2>
            <p>Действия, переключения и контекстные меню.</p>
          </div>
          <div className="kit-grid">
            <div className="kit-panel wide">
              <h3>Кнопки</h3>
              <p className="caption">
                Основное, второстепенное и компактное действия
              </p>
              <div className="row">
                <Button>
                  <Plus size={18} /> Добавить
                </Button>
                <Button variant="secondary">Отмена</Button>
                <Button variant="text">
                  Подробнее <ArrowUpRight size={16} />
                </Button>
                <Button variant="icon" aria-label="Помощь">
                  <CircleHelp size={20} />
                </Button>
                <Button disabled>Недоступно</Button>
              </div>
            </div>
            <div className="kit-panel">
              <h3>Переключатель</h3>
              <p className="caption">Один вариант из нескольких</p>
              <SegmentedControl
                label="Тип операции"
                options={options}
                defaultValue="all"
              />
            </div>
            <div className="kit-panel">
              <h3>Контекстное меню</h3>
              <p className="caption">Действия, относящиеся к элементу</p>
              <div className="row">
                <ActionMenu
                  label="Действия с категорией"
                  options={[
                    { value: "edit", label: "Изменить" },
                    { value: "archive", label: "Архивировать" },
                    {
                      value: "disabled",
                      label: "Недоступное действие",
                      disabled: true,
                    },
                  ]}
                />
                <span className="caption">Откройте меню</span>
              </div>
            </div>
            <div className="kit-panel wide">
              <h3>Модальное окно и раскрывающийся раздел</h3>
              <SharedComponentsExample />
            </div>
            <div className="kit-panel wide">
              <h3>Диалог</h3>
              <p className="caption">
                Для подтверждения действия. Закрывается по Escape и кнопке
                отмены.
              </p>
              <ConfirmDialog
                trigger="Открыть диалог"
                title="Удалить категорию?"
                description="Это пример подтверждения действия. Данные приложения не изменятся."
                confirmLabel="Подтвердить"
              />
            </div>
          </div>
        </section>
        <section className="section" id="forms">
          <div className="section-header">
            <h2>Поля и выбор</h2>
            <p>Понятные подписи, состояния и обратная связь.</p>
          </div>
          <div className="kit-grid">
            <div className="kit-panel">
              <h3>Текстовые поля</h3>
              <p className="caption">Ввод, подсказка и ошибка</p>
              <div className="stack">
                <TextField label="Название" placeholder="Например, Продукты" />
                <TextField
                  label="Описание"
                  placeholder="Добавьте описание"
                  description="Необязательное поле"
                />
                <TextField
                  label="Сумма"
                  defaultValue="0"
                  error="Введите сумму больше нуля"
                />
                <TextField
                  label="Недоступное поле"
                  placeholder="Недоступно"
                  disabled
                />
              </div>
            </div>
            <div className="kit-panel">
              <h3>Выбор</h3>
              <p className="caption">Список, флажок и переключатель</p>
              <div className="stack">
                <SelectField
                  label="Категория"
                  placeholder="Выберите категорию"
                  options={[
                    { value: "food", label: "Продукты" },
                    { value: "cafe", label: "Кафе" },
                    { value: "transport", label: "Транспорт" },
                  ]}
                />
                <SelectField
                  label="Недоступный список"
                  disabled
                  options={options}
                />
                <SelectField
                  label="Загрузка списка"
                  loading
                  options={options}
                />
                <DateExample />
                <MonthExample />
                <DateRangeExample />
                <CheckControl label="Учитывать в статистике" defaultChecked />
                <CheckControl label="Недоступный вариант" disabled />
                <SwitchControl label="Регулярная операция" />
                <SwitchControl label="Недоступный переключатель" disabled />
              </div>
            </div>
          </div>
        </section>
        <section className="section" id="surfaces">
          <div className="section-header">
            <h2>Карточки</h2>
            <p>Поверхности для данных с разным визуальным приоритетом.</p>
          </div>
          <div className="card-examples">
            <Card>
              <p>Светлая поверхность</p>
              <strong>128 400 ₽</strong>
            </Card>
            <Card tone="dark">
              <p>Тёмная поверхность</p>
              <strong>42 600 ₽</strong>
            </Card>
            <Card tone="lime">
              <p>Акцентная поверхность</p>
              <strong>85 800 ₽</strong>
            </Card>
          </div>
        </section>
        <section className="section" id="palette">
          <div className="section-header">
            <h2>Цвет и типографика</h2>
            <p>Утверждённая палитра и Manrope.</p>
          </div>
          <div className="kit-panel">
            <div className="swatches">
              {colors.map(([name, color]) => (
                <div className="swatch" key={color}>
                  <div
                    className="swatch-color"
                    style={{ backgroundColor: color }}
                  />
                  <strong>{name}</strong>
                  {color}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
