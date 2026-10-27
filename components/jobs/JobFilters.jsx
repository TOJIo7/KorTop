"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { toJobsQuery } from "@/lib/jobFilters";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import RegionPicker from "./RegionPicker";

// Фильтры меняют адрес (?text=...&region=...), а серверная страница сама перезапрашивает данные
export default function JobFilters({ initial }) {
  const t = useTranslations("jobs.filters");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [text, setText] = useState(initial.text);
  const [region, setRegion] = useState(initial.region);
  const [housing, setHousing] = useState(initial.housing);
  const [foreign, setForeign] = useState(initial.foreign ?? false);
  const [salary, setSalary] = useState(initial.salary ?? "");

  function submit(e) {
    e.preventDefault();
    const query = toJobsQuery({ text: text.trim(), region, housing, foreign, salary: Number(salary) || null });
    startTransition(() => router.push({ pathname: "/jobs", query }));
  }

  return (
    <form onSubmit={submit} role="search" className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("textPlaceholder")}
        aria-label={t("text")}
        enterKeyHint="search"
      />
      <RegionPicker value={region} onChange={setRegion} />
      <div className="flex flex-wrap items-center gap-x-5">
        <Checkbox checked={housing} onChange={setHousing} label={t("housing")} />
        <Checkbox checked={foreign} onChange={setForeign} label={t("foreign")} />
      </div>
      <Input
        type="number"
        inputMode="numeric"
        min="0"
        step="5000"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
        placeholder={t("salary")}
        aria-label={t("salary")}
      />
      <Button type="submit" disabled={pending}>
        <Search size={18} aria-hidden="true" />
        {pending ? t("searching") : t("submit")}
      </Button>
    </form>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex min-h-11 items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-brand-700" />
      {label}
    </label>
  );
}
