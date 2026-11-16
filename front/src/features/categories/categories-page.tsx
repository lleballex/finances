"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FolderOpen, LoaderCircle, Plus, Repeat2 } from "lucide-react";
import { api } from "@/shared/api/client";
import {
  ActionMenu,
  Button,
  ColorField,
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
function errorMessage(error: unknown, fallback: string) {
  const message = axios.isAxiosError(error)
    ? error.response?.data?.message
    : null;
  return typeof message === "string" &&
    axios.isAxiosError(error) &&
    error.response?.status === 409
    ? message
    : fallback;
}
export function CategoriesPage() {
  const client = useQueryClient();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [parentId, setParentId] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("#ddf45a");
  const [regular, setRegular] = useState(false);
  const save = useMutation({
    mutationFn: () => {
      const input = {
        name: name.trim(),
        type,
        parentId: parentId || null,
        emoji,
        color,
        isRegular: regular,
      };
      return editing
        ? api.put(`/categories/${editing.id}`, input)
        : api.post("/categories", input);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["categories"] });
      setOpen(false);
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["categories"] });
      setDeleting(null);
    },
  });
  function openForm(item: Category | null) {
    setEditing(item);
    setName(item?.name ?? "");
    setType(item?.type ?? "expense");
    setParentId(item?.parentId ?? "");
    setEmoji(item?.emoji ?? "");
    setColor(item?.color ?? "#ddf45a");
    setRegular(item?.isRegular ?? false);
    save.reset();
    setOpen(true);
  }
  const hasChildren =
    editing && categories.data?.some((item) => item.parentId === editing.id);
  function row(item: Category, child = false) {
    return (
      <div
        className={`category-card-row${child ? " category-card-row--child" : ""}`}
        key={item.id}
      >
        <span
          className="category-emoji"
          style={{ backgroundColor: item.color }}
          aria-hidden="true"
        >
          {item.emoji}
        </span>
        <strong>
          {item.name}{" "}
          {item.isRegular && (
            <span
              className="category-repeat"
              aria-label="Регулярная категория"
              title="Регулярная категория"
            >
              <Repeat2 size={12} aria-hidden="true" />
            </span>
          )}
        </strong>
        <ActionMenu
          label={`Действия: ${item.name}`}
          options={[
            { value: "edit", label: "Изменить" },
            { value: "delete", label: "Удалить" },
          ]}
          onAction={(action) => {
            if (action === "edit") openForm(item);
            if (action === "delete") {
              remove.reset();
              setDeleting(item);
            }
          }}
        />
      </div>
    );
  }
  return (
    <div className="categories-page">
      <header className="categories-header">
        <h1>Категории</h1>
        <Button onClick={() => openForm(null)}>
          <Plus size={20} />
          Добавить категорию
        </Button>
      </header>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Изменить категорию" : "Добавить категорию"}
      >
        <form
          className="transaction-form"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
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
                .filter(
                  (item) =>
                    !item.parentId &&
                    item.type === type &&
                    item.id !== editing?.id &&
                    !hasChildren,
                )
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
          <ColorField label="Цвет" value={color} onValueChange={setColor} />
          <SwitchControl
            label="Регулярная категория"
            checked={regular}
            onCheckedChange={setRegular}
          />
          {save.isError && (
            <p className="ui-error" role="alert">
              {errorMessage(
                save.error,
                "Не удалось сохранить категорию. Попробуйте снова.",
              )}
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
              disabled={!name.trim() || !emoji || !color || save.isPending}
            >
              Сохранить
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!deleting}
        onOpenChange={(next) => {
          if (!next) setDeleting(null);
        }}
        title="Удалить категорию?"
      >
        <p>Категория «{deleting?.name}» будет удалена.</p>
        {remove.isError && (
          <p className="ui-error" role="alert">
            {errorMessage(
              remove.error,
              "Не удалось удалить категорию. Попробуйте снова.",
            )}
          </p>
        )}
        <div className="transaction-form-actions">
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Отмена
          </Button>
          <Button
            disabled={remove.isPending}
            onClick={() => deleting && remove.mutate(deleting.id)}
          >
            Удалить
          </Button>
        </div>
      </Modal>
      {categories.isError ? (
        <p>Не удалось загрузить категории.</p>
      ) : categories.isPending ? (
        <span role="status" aria-label="Загрузка категорий">
          <LoaderCircle className="ui-spinner" size={24} aria-hidden="true" />
        </span>
      ) : categories.data.length === 0 ? (
        <div className="categories-empty">
          <FolderOpen size={32} aria-hidden="true" />
          <h2>Категорий пока нет</h2>
          <p>Создайте категорию для учёта доходов и расходов.</p>
          <Button onClick={() => openForm(null)}>
            <Plus size={20} />
            Добавить категорию
          </Button>
        </div>
      ) : (
        (["expense", "income"] as const)
          .filter((kind) =>
            categories.data.some(
              (item) => item.type === kind && !item.parentId,
            ),
          )
          .map((kind) => {
            const roots = categories.data.filter(
              (item) => item.type === kind && !item.parentId,
            );
            return (
              <section className="categories-section" key={kind}>
                <h2>
                  {kind === "expense" ? "Расходы" : "Доходы"}{" "}
                  <span className="categories-count">{roots.length}</span>
                </h2>
                <div className="categories-grid">
                  {[0, 1].map((column) => (
                    <div className="category-column" key={column}>
                      {roots
                        .filter((_, index) => index % 2 === column)
                        .map((item) => (
                          <article className="category-card" key={item.id}>
                            {row(item)}
                            {categories.data
                              .filter((child) => child.parentId === item.id)
                              .map((child) => row(child, true))}
                          </article>
                        ))}
                    </div>
                  ))}
                </div>
              </section>
            );
          })
      )}
    </div>
  );
}
