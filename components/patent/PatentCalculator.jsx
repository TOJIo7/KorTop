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
    <section className="card flex flex-col gap-4 p-5">
      <h2 className="flex items-center gap-2 text-xl">
        <Calculator size={22} className="text-pom-600" aria-hidden="true" />
        {t("title")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Row label={t("salary")}>
          <Input {...field("salary")} />
        </Row>
        <Row label={t("region")}>
          <RegionPicker value={region} onChange={setRegion} />
        </Row>
      </div>
      <Row label={t("patent")}>
        {knownPatent ? (
          <p className="flex min-h-12 items-center rounded-lg bg-accent-100 px-3.5 money text-accent-800">
            {formatRub(knownPatent.monthly, locale)}
          </p>
        ) : (
          <>
            <Input {...field("patent")} />
            <p className="mt-1 text-sm text-slate-600">{t("patentUnknown")}</p>
          </>
        )}
      </Row>
      <div className="grid gap-4 sm:grid-cols-3">
        <Row label={t("housing")}>
          <Input {...field("housing")} />
        </Row>
        <Row label={t("food")}>
          <Input {...field("food")} />
        </Row>
        <Row label={t("transport")}>
          <Input {...field("transport")} />
        </Row>
      </div>

      <div className={`rounded-lg p-5 text-white ${left >= 0 ? "bg-brand-900" : "bg-pom-700"}`} aria-live="polite">
        <p className="text-sm font-bold uppercase tracking-wider text-white/75">{t("left")}</p>
        <p className="mt-1 money text-[34px] leading-none">{formatRub(left, locale)}</p>
        {rate && <p className="mt-2 text-lg text-accent-300">≈ {formatSomoni(left * rate, locale)}</p>}
        <p className="mt-3 border-t border-white/20 pt-3 text-sm text-white/75">{t("formula")}</p>
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
