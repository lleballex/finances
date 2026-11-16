"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Plus } from "lucide-react";
import { api } from "@/shared/api/client";
import {
  Button,
  EmojiField,
  Modal,
  SelectField,
  SwitchControl,
  TextField,
} from "@/shared/ui";
import "./categories.css";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  emoji: string;
  color: string;
  isRegular: boolean;
  parentId: string | null;
};
const colors = [
  { value: "#dce9c8", label: "Зелёный" },
  { value: "#f1dfce", label: "Персиковый" },
  { value: "#f1e8c6", label: "Жёлтый" },
  { value: "#dce5f0", label: "Голубой" },
  { value: "#f0dfda", label: "Розовый" },
  { value: "#e8ddf1", label: "Сиреневый" },
];

export function CategoriesPage() {
  const client = useQueryClient();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [parentId, setParentId] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("");
  const [regular, setRegular] = useState(false);
  const create = useMutation({
    mutationFn: () =>
      api.post("/categories", {
        name: name.trim(),
        type,
        parentId: parentId || undefined,
        emoji,
        color,
        isRegular: regular,
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
    },
  });
  const reset = () => {
    setName("");
    setType("expense");
    setParentId("");
    setEmoji("");
    setColor("");
    setRegular(false);
    create.reset();
  };
  return (
    <div className="categories-page">
      <header className="categories-header">
        <h1>Категории</h1>
        <Modal
          open={open}
          onOpenChange={(next) => {
            if (next) reset();
            setOpen(next);
          }}
          title="Добавить категорию"
          trigger={
            <>
              <Plus size={20} />
              Добавить категорию
            </>
          }
        >
          <form
            className="transaction-form"
            onSubmit={(event) => {
              event.preventDefault();
              create.mutate();
            }}
          >
            <TextField
              label="Название"
              value={name}
              onValueChange={setName}
              maxLength={100}
              required
            />
            <SelectField
              label="Тип"
              value={type}
              options={[
                { value: "expense", label: "Расход" },
                { value: "income", label: "Доход" },
              ]}
              onValueChange={(value) => {
                if (value === "income" || value === "expense") {
                  setType(value);
                  setParentId("");
                }
              }}
            />
            <SelectField
              label="Родительская категория"
              placeholder="Без родительской категории"
              value={parentId || null}
              options={[
                { value: "none", label: "Без родительской категории" },
                ...(categories.data ?? [])
                  .filter((item) => !item.parentId && item.type === type)
                  .map((item) => ({
                    value: item.id,
                    label: `${item.emoji} ${item.name}`,
                  })),
              ]}
              onValueChange={(value) =>
                setParentId(value === "none" ? "" : (value ?? ""))
              }
            />
            <EmojiField label="Эмодзи" value={emoji} onValueChange={setEmoji} />
            <SelectField
              label="Цвет"
              placeholder="Выберите цвет"
              value={color || null}
              options={colors}
              onValueChange={(value) => setColor(value ?? "")}
            />
            <SwitchControl
              label="Регулярная категория"
              checked={regular}
              onCheckedChange={setRegular}
            />
            {create.isError && (
              <p className="ui-error">
                Не удалось создать категорию. Попробуйте снова.
              </p>
            )}
            <div className="transaction-form-actions">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setOpen(false)}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || !emoji || !color || create.isPending}
              >
                Сохранить
              </Button>
            </div>
          </form>
        </Modal>
      </header>
      {categories.isError ? (
        <p>Не удалось загрузить категории.</p>
      ) : categories.isPending ? (
        <span role="status" aria-label="Загрузка категорий">
          <LoaderCircle className="ui-spinner" size={24} aria-hidden="true" />
        </span>
      ) : (
        (["expense", "income"] as const).map((kind) => (
          <section className="categories-section" key={kind}>
            <h2>{kind === "expense" ? "Расходы" : "Доходы"}</h2>
            <div className="categories-grid">
              {categories.data
                .filter((item) => item.type === kind && !item.parentId)
                .map((item) => (
                  <article className="category-card" key={item.id}>
                    <div className="category-card-row">
                      <span
                        className="category-emoji"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.emoji}
                      </span>
                      <strong>{item.name}</strong>
                    </div>
                    {categories.data
                      .filter((child) => child.parentId === item.id)
                      .map((child) => (
                        <div className="category-card-row" key={child.id}>
                          <span
                            className="category-emoji"
                            style={{ backgroundColor: child.color }}
                          >
                            {child.emoji}
                          </span>
                          <strong>{child.name}</strong>
                        </div>
                      ))}
                  </article>
                ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
