"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { LoaderCircle, Plus } from "lucide-react";
import { api } from "@/shared/api/client";
import type { Transaction } from "./types";
import {
  Button,
  DateField,
  Modal,
  MonthField,
  SelectField,
  SwitchControl,
  TextField,
} from "@/shared/ui";

const schema = z.object({
  categoryId: z.string().min(1, "Выберите категорию"),
  amount: z
    .string()
    .regex(
      /^(?!0+(?:[.,]0{1,2})?$)\d{1,10}(?:[.,]\d{1,2})?$/,
      "Введите сумму больше нуля, не более двух знаков после запятой",
    ),
  operationDate: z.iso.date("Укажите дату операции"),
  accountingPeriod: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Укажите учётный период"),
  description: z.string(),
  isRegular: z.boolean(),
});
type Values = z.infer<typeof schema>;
type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  emoji: string;
  isRegular: boolean;
  parentId: string | null;
};
let lastOperationDate: string | undefined;
function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function defaults(): Values {
  const date = lastOperationDate ?? today();
  return {
    categoryId: "",
    amount: "",
    operationDate: date,
    accountingPeriod: date.slice(0, 7),
    description: "",
    isRegular: false,
  };
}

export function CreateTransaction({
  onCreated,
  editing,
  onEditClose,
}: {
  onCreated: () => void;
  editing?: Transaction | null;
  onEditClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [periodOverridden, setPeriodOverridden] = useState(
    !!editing && editing.period !== editing.date.slice(0, 7),
  );
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: editing
      ? {
          categoryId: editing.categoryId,
          amount: editing.amount.replace(/^-/, ""),
          operationDate: editing.date,
          accountingPeriod: editing.period,
          description: editing.description ?? "",
          isRegular: editing.regular,
        }
      : defaults(),
  });
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.get<Category[]>("/categories")).data,
    enabled: open || !!editing,
  });
  const mutation = useMutation({
    mutationFn: async (values: Values) =>
      api[editing ? "put" : "post"](
        editing ? `/transactions/${editing.id}` : "/transactions",
        {
          ...values,
          amount: values.amount.replace(",", "."),
          accountingPeriod: `${values.accountingPeriod}-01`,
        },
      ),
    onSuccess: (_result, values) => {
      if (!editing) lastOperationDate = values.operationDate;
      setOpen(false);
      onEditClose?.();
      onCreated();
    },
  });
  const options = (categories.data ?? []).map((category) => ({
    value: category.id,
    label: `${category.emoji} ${category.name} · ${category.type === "expense" ? "Расход" : "Доход"}`,
  }));
  return (
    <Modal
      open={open || !!editing}
      onOpenChange={(next) => {
        if (!next && editing) {
          onEditClose?.();
          return;
        }
        if (next) {
          form.reset(defaults());
          setPeriodOverridden(false);
          mutation.reset();
        }
        setOpen(next);
      }}
      title={editing ? "Изменить транзакцию" : "Добавить транзакцию"}
      trigger={
        <>
          <Plus size={20} />
          Добавить транзакцию
        </>
      }
    >
      <form
        className="transaction-form"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Controller
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <SelectField
              label="Категория"
              options={options}
              loading={categories.isFetching}
              disabled={categories.isError || !categories.data?.length}
              value={field.value || null}
              onValueChange={(value) => {
                field.onChange(value ?? "");
                form.setValue(
                  "isRegular",
                  categories.data?.find((category) => category.id === value)
                    ?.isRegular ?? false,
                );
              }}
            />
          )}
        />
        {categories.isError && !categories.isFetching && (
          <div className="ui-error">
            Не удалось получить категории.{" "}
            <Button
              variant="text"
              type="button"
              onClick={() => categories.refetch()}
            >
              Повторить
            </Button>
          </div>
        )}
        {!categories.isFetching &&
          !categories.isError &&
          !categories.data?.length && (
            <p className="ui-description">
              Нет категорий. <Link href="/categories">Создать категорию</Link>
            </p>
          )}
        {form.formState.errors.categoryId && (
          <p className="ui-error">{form.formState.errors.categoryId.message}</p>
        )}
        <Controller
          control={form.control}
          name="amount"
          render={({ field }) => (
            <TextField
              label="Сумма"
              inputMode="decimal"
              placeholder="0,00"
              value={field.value}
              onValueChange={field.onChange}
              error={form.formState.errors.amount?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="operationDate"
          render={({ field }) => (
            <DateField
              label="Дата операции"
              value={field.value}
              onChange={(date) => {
                field.onChange(date);
                if (!periodOverridden && date)
                  form.setValue("accountingPeriod", date.slice(0, 7));
              }}
            />
          )}
        />
        {form.formState.errors.operationDate && (
          <p className="ui-error">
            {form.formState.errors.operationDate.message}
          </p>
        )}
        <Controller
          control={form.control}
          name="accountingPeriod"
          render={({ field }) => (
            <MonthField
              label="Учётный период"
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                setPeriodOverridden(true);
              }}
              error={form.formState.errors.accountingPeriod?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <TextField
              label="Описание"
              placeholder="Необязательно"
              value={field.value}
              onValueChange={field.onChange}
              error={form.formState.errors.description?.message}
            />
          )}
        />
        <Controller
          control={form.control}
          name="isRegular"
          render={({ field }) => (
            <SwitchControl
              label="Регулярная транзакция"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        {mutation.isError && (
          <p className="ui-error">
            Не удалось сохранить транзакцию. Проверьте данные и попробуйте
            снова.
          </p>
        )}
        <div className="transaction-form-actions">
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              setOpen(false);
              onEditClose?.();
            }}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <LoaderCircle
                className="ui-spinner"
                size={18}
                aria-hidden="true"
              />
            )}
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
