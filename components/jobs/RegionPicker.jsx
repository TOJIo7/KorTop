"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { findRegion, regionName, sortedRegions } from "@/lib/regions";
import Input from "@/components/ui/Input";

// Выбор региона из всех субъектов РФ с поиском по названию (V-3)
export default function RegionPicker({ value, onChange }) {
  const t = useTranslations("jobs.filters");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = sortedRegions(locale);
    if (!q) return all;
    // Ищем и по таджикскому, и по русскому названию
    return all.filter((r) => r.name.tg.toLowerCase().includes(q) || r.name.ru.toLowerCase().includes(q));
  }, [query, locale]);

  function choose(id) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  const selected = findRegion(value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-300 bg-card px-3 text-left"
      >
        <MapPin size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
        <span className="flex-1 truncate">{selected ? regionName(selected, locale) : t("allRegions")}</span>
        <ChevronDown size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 rounded-lg border border-slate-200 bg-card p-2 shadow-lg">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("regionSearch")}
            aria-label={t("regionSearch")}
          />
          <ul className="mt-2 max-h-72 overflow-y-auto" role="listbox">
            {!query && <Option label={t("allRegions")} active={!value} onClick={() => choose("")} />}
            {list.map((r) => (
              <Option key={r.id} label={regionName(r, locale)} active={r.id === value} onClick={() => choose(r.id)} />
            ))}
            {list.length === 0 && <li className="px-3 py-2 text-slate-500">{t("regionNotFound")}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

function Option({ label, active, onClick }) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onClick={onClick}
        className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left hover:bg-slate-100 ${active ? "font-semibold text-brand-700" : ""}`}
      >
        <span className="flex-1">{label}</span>
        {active && <Check size={18} aria-hidden="true" />}
      </button>
    </li>
  );
}
