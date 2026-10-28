"use client";

import { useTranslations } from "next-intl";
import { Check, CircleAlert, ExternalLink } from "lucide-react";
import { useChecklist } from "@/hooks/useChecklist";

// Пошаговый чек-лист (D-1) с отметками в браузере (D-2).
// steps готовит сервер: тексты уже на нужном языке, даты отформатированы
export default function DocumentsChecklist({ steps }) {
  const t = useTranslations("documents");
  const { done, toggle } = useChecklist();

  const doneCount = steps.filter((s) => done.includes(s.id)).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2" aria-live="polite">
        <p className="font-medium text-slate-700">{t("progress", { done: doneCount, total: steps.length })}</p>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
          <div className="h-full rounded-full bg-pom-600 transition-[width] duration-500" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
      </div>
      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const checked = done.includes(step.id);
          const last = index === steps.length - 1;
          return (
            <li key={step.id} className="relative flex gap-4 pb-5">
              {/* Линия пути между кружками */}
              {!last && <span className="absolute bottom-0 left-5.25 top-12 w-0.5 bg-line" aria-hidden="true" />}
              <label className="relative shrink-0 cursor-pointer">
                <input type="checkbox" checked={checked} onChange={() => toggle(step.id)} className="peer sr-only" />
                <span
                  className={`flex size-11 items-center justify-center rounded-full border-2 font-display font-bold transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-500 ${
                    checked ? "border-pom-600 bg-pom-600 text-white" : "border-slate-300 bg-card text-slate-700 hover:border-slate-900"
                  }`}
                >
                  {checked ? <Check size={22} strokeWidth={3} aria-hidden="true" /> : index + 1}
                </span>
                <span className="sr-only">{step.title}</span>
              </label>
              <div className="card min-w-0 flex-1 p-4">
              <h2 className={`font-sans text-lg font-semibold leading-snug ${checked ? "text-slate-500 line-through" : ""}`}>{step.title}</h2>
              <p className="mt-2 text-slate-800">{step.text}</p>
              <dl className="mt-3 grid gap-2 border-t border-line pt-3 text-sm sm:grid-cols-3">
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
