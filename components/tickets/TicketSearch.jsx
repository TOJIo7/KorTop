"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";

// Откуда / куда / месяц (T-1). Выбор пишется в адрес, цены загружает сервер.
// months — [{ value: "2026-11", label: "ноябрь 2026" }]: подписи готовит сервер,
// иначе браузер может отформатировать месяц иначе и React ругается на несовпадение
export default function TicketSearch({ initial, destinations, months }) {
  const t = useTranslations("tickets");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  function submit(e) {
    e.preventDefault();
    startTransition(() => router.push({ pathname: "/tickets", query: form }));
  }

  const select = (name) => ({
    value: form[name],
    onChange: (e) => setForm({ ...form, [name]: e.target.value }),
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 card p-4 sm:flex-row sm:items-end">
      <Field label={t("from")}>
        <Select {...select("from")}>
          <option value="DYU">{t("origins.DYU")}</option>
          <option value="LBD">{t("origins.LBD")}</option>
        </Select>
      </Field>
      <Field label={t("to")}>
        <Select {...select("to")}>
          {destinations.map((d) => (
            <option key={d.airport} value={d.airport}>
              {d.name[locale]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("month")}>
        <Select {...select("month")}>
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
      </Field>
      <Button type="submit" disabled={pending}>
        <Search size={18} aria-hidden="true" />
        {pending ? t("searching") : t("submit")}
      </Button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
