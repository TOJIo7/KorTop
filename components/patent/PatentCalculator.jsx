"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calculator } from "lucide-react";
import { getPatent } from "@/lib/patents";
import { formatRub, formatSomoni } from "@/lib/format";
import RegionPicker from "@/components/jobs/RegionPicker";
import Input from "@/components/ui/Input";

// «Сколько останется»: зарплата − патент − жильё − еда − транспорт (P-3).
// Расходы вводит сам человек: средних цифр не подставляем, чтобы не выдумывать.
// rate — сомони за 1 ₽ (из lib/rates.js) или null, если курс недоступен
export default function PatentCalculator({ initialSalary = "", initialRegion = "", rate = null }) {
  const t = useTranslations("calculator");
  const locale = useLocale();
  const [region, setRegion] = useState(initialRegion);
  const [values, setValues] = useState({ salary: initialSalary, patent: "", housing: "", food: "", transport: "" });

  const knownPatent = getPatent(region);
  const num = (v) => Math.max(0, Number(v) || 0);
  const patentCost = knownPatent ? knownPatent.monthly : num(values.patent);
  const expenses = patentCost + num(values.housing) + num(values.food) + num(values.transport);
  const left = num(values.salary) - expenses;

  const field = (name) => ({
    value: values[name],
    onChange: (e) => setValues({ ...values, [name]: e.target.value }),
    type: "number",
    inputMode: "numeric",
    min: "0",
    placeholder: "0",
    "aria-label": t(name),
  });

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <Calculator size={22} className="text-brand-700" aria-hidden="true" />
        {t("title")}
      </h2>

      <Row label={t("salary")}>
        <Input {...field("salary")} />
      </Row>
      <Row label={t("region")}>
        <RegionPicker value={region} onChange={setRegion} />
      </Row>
      <Row label={t("patent")}>
        {knownPatent ? (
          <p className="flex min-h-11 items-center font-semibold">{formatRub(knownPatent.monthly, locale)}</p>
        ) : (
          <>
            <Input {...field("patent")} />
            <p className="mt-1 text-sm text-slate-600">{t("patentUnknown")}</p>
          </>
        )}
      </Row>
      <Row label={t("housing")}>
        <Input {...field("housing")} />
      </Row>
      <Row label={t("food")}>
        <Input {...field("food")} />
      </Row>
      <Row label={t("transport")}>
        <Input {...field("transport")} />
      </Row>

      <div className={`rounded-xl p-4 ${left >= 0 ? "bg-brand-50" : "bg-red-50"}`} aria-live="polite">
        <p className="text-slate-700">{t("left")}</p>
        <p className={`text-2xl font-bold ${left >= 0 ? "text-brand-800" : "text-red-700"}`}>{formatRub(left, locale)}</p>
        {rate && <p className="text-lg font-semibold text-slate-800">≈ {formatSomoni(left * rate, locale)}</p>}
        <p className="mt-1 text-sm text-slate-600">{t("formula")}</p>
      </div>
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </div>
  );
}
