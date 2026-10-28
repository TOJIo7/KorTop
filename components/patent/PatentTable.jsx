"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Input from "@/components/ui/Input";

// Таблица патента по регионам с поиском (P-1). rows готовит сервер:
// [{ id, name, nameRu, price, law, source, checked }] — price null, если данных нет (P-2)
export default function PatentTable({ rows }) {
  const t = useTranslations("patent");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const visible = q ? rows.filter((r) => r.name.toLowerCase().includes(q) || r.nameRu.toLowerCase().includes(q)) : rows;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t("tableTitle")}</h2>
      <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search")} aria-label={t("search")} />
      <ul className="divide-y divide-slate-200 card">
        {visible.map((r) => (
          <li key={r.id} className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="flex-1 font-medium">{r.name}</span>
            {r.price ? (
              <span className="flex flex-col sm:items-end">
                <span className="text-lg font-bold">{t("perMonth", { price: r.price })}</span>
                <a href={r.source} target="_blank" rel="noopener" className="text-sm text-brand-700 underline">
                  {r.law}
                </a>
                <span className="text-sm text-slate-500">{r.checked}</span>
              </span>
            ) : (
              <span className="text-slate-500">{t("noData")}</span>
            )}
          </li>
        ))}
        {visible.length === 0 && <li className="p-3 text-slate-500">{t("notFound")}</li>}
      </ul>
    </section>
  );
}
