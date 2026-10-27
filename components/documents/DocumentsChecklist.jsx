"use client";

import { useTranslations } from "next-intl";
import { CircleAlert, ExternalLink } from "lucide-react";
import { useChecklist } from "@/hooks/useChecklist";

// Пошаговый чек-лист (D-1) с отметками в браузере (D-2).
// steps готовит сервер: тексты уже на нужном языке, даты отформатированы
export default function DocumentsChecklist({ steps }) {
  const t = useTranslations("documents");
  const { done, toggle } = useChecklist();

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium text-slate-700" aria-live="polite">
        {t("progress", { done: steps.filter((s) => done.includes(s.id)).length, total: steps.length })}
      </p>
      <ol className="flex flex-col gap-3">
        {steps.map((step, index) => {
          const checked = done.includes(step.id);
          return (
            <li key={step.id} className={`rounded-2xl border bg-white p-4 ${checked ? "border-brand-600" : "border-slate-200"}`}>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={checked} onChange={() => toggle(step.id)} className="mt-1 size-6 shrink-0 accent-brand-700" />
                <span className={`text-lg font-semibold ${checked ? "text-slate-500 line-through" : ""}`}>
                  {index + 1}. {step.title}
                </span>
              </label>
              <p className="mt-2 text-slate-800">{step.text}</p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <Fact label={t("where")} value={step.where} />
                <Fact label={t("deadline")} value={step.deadline} />
                <Fact label={t("cost")} value={step.cost ?? t("costUnknown")} />
              </dl>
              <div className="mt-3 flex flex-col gap-1 text-sm">
                <a href={step.source} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1 text-brand-700 underline">
                  <ExternalLink size={16} aria-hidden="true" /> {step.sourceTitle}
                </a>
                {step.checked ? (
                  <span className="text-slate-500">{step.checked}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-medium text-accent-800">
                    <CircleAlert size={16} aria-hidden="true" /> {t("notVerified")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Fact({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
