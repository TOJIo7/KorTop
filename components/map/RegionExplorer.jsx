"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Receipt, ZoomOut } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/format";
import { buttonStyles } from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Skeleton from "@/components/ui/Skeleton";
import CountUp from "./CountUp";
import RegionMap, { BUCKETS } from "./RegionMap";
import YandexJobsMap, { hasYandexMaps } from "./YandexJobsMap";

const TOP_COUNT = 5;

// Карта, карточка выбранного региона и рейтинг. regions готовит сервер: имена на нужном языке, числа, патент
export default function RegionExplorer({ regions, dataDate }) {
  const t = useTranslations("map");
  const locale = useLocale();
  const [shapes, setShapes] = useState(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    fetch("/region-map.json")
      .then((res) => {
        if (!res.ok) throw new Error(`region-map ${res.status}`);
        return res.json();
      })
      .then(setShapes)
      .catch(() => setMapFailed(true));
  }, []);

  const counts = useMemo(() => Object.fromEntries(regions.map((r) => [r.id, r.count])), [regions]);
  const known = regions.filter((r) => r.count !== null);
  const total = known.reduce((sum, r) => sum + r.count, 0);
  const top = [...known].sort((a, b) => b.count - a.count).slice(0, TOP_COUNT);
  const selected = regions.find((r) => r.id === selectedId) ?? null;
  const hovered = regions.find((r) => r.id === hoveredId) ?? null;
  const isDrawn = !shapes || shapes.regions.some((r) => r.id === selectedId);

  return (
    <div className="flex flex-col gap-4">
      <section className="card flex flex-col gap-3 overflow-hidden p-3 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          {known.length > 0 ? (
            <p>
              <span className="money text-3xl text-slate-900 sm:text-4xl"><CountUp value={total} /></span>{" "}
              <span className="text-slate-600">{t("total")}</span>
            </p>
          ) : (
            <p role="status" className="text-slate-600">{t("countsError")}</p>
          )}
          {/* Подсказка при наведении мышью: на телефоне наведения нет, там сразу карточка региона */}
          <p className="hidden min-h-6 text-sm font-medium text-slate-700 pointer-fine:block">
            {hovered && `${hovered.name}: ${hovered.count === null ? t("noData") : formatNumber(hovered.count, locale)}`}
          </p>
        </div>

        {mapFailed ? (
          <p role="alert" className="rounded-lg bg-accent-100 p-4 text-accent-800">{t("mapError")}</p>
        ) : shapes ? (
          <RegionMap shapes={shapes} counts={counts} selectedId={selectedId} onSelect={setSelectedId} onHover={setHoveredId} label={t("legend")} />
        ) : (
          <Skeleton className="aspect-[1000/552] w-full" />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{t("legend")}</span>
            <span className="flex overflow-hidden rounded-sm" aria-hidden="true">
              {BUCKETS.map((bucket) => (
                <span key={bucket.color} className="h-3 w-6" style={{ background: bucket.color }} />
              ))}
            </span>
          </div>
          {selectedId && (
            <button type="button" onClick={() => setSelectedId(null)} className="inline-flex min-h-11 items-center gap-2 font-semibold text-brand-700">
              <ZoomOut size={18} aria-hidden="true" /> {t("allRussia")}
            </button>
          )}
        </div>
      </section>

      {/* Без ключа Яндекса страница работает как обычно, только без этого блока */}
      {selected && hasYandexMaps && <YandexJobsMap regionId={selected.id} regionName={selected.name} />}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card flex flex-col gap-3 p-5" aria-live="polite">
          <label className="flex flex-col gap-1">
            <span className="font-medium text-slate-700">{t("choose")}</span>
            <Select value={selectedId ?? ""} onChange={(e) => setSelectedId(e.target.value || null)}>
              <option value="">{t("allRussia")}</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </label>
          {selected ? (
            <div className="flex flex-col gap-3">
              <h2 className="text-xl">{selected.name}</h2>
              <p>
                {selected.count === null ? (
                  <span className="text-slate-600">{t("noData")}</span>
                ) : (
                  <>
                    <span className="money text-3xl text-brand-700"><CountUp value={selected.count} /></span>{" "}
                    <span className="text-slate-600">{t("jobs")}</span>
                  </>
                )}
              </p>
              <p className="flex items-center gap-2 text-slate-700">
                <Receipt size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
                {t("patent")}: {selected.patent ?? t("patentUnknown")}
              </p>
              {!isDrawn && <p className="text-sm text-slate-600">{t("notDrawn")}</p>}
              <Link href={{ pathname: "/jobs", query: { region: selected.id } }} className={buttonStyles()}>
                {t("showJobs")} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <p className="text-slate-600">{t("prompt")}</p>
          )}
        </section>

        {top.length > 0 && (
          <section className="card flex flex-col gap-2 p-5">
            <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-500">{t("top")}</h2>
            <ol className="flex flex-col">
              {top.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    aria-pressed={r.id === selectedId}
                    className="flex min-h-11 w-full flex-col justify-center gap-1 rounded-md py-1.5 text-left hover:bg-slate-100"
                  >
                    <span className="flex justify-between gap-3">
                      <span className="font-medium">{r.name}</span>
                      <span className="money text-slate-900"><CountUp value={r.count} /></span>
                    </span>
                    <span className="h-1.5 rounded-full bg-brand-600" style={{ width: `${(r.count / top[0].count) * 100}%` }} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      {dataDate && <p className="text-sm text-slate-500">{t("dataAt", { date: dataDate })}</p>}
    </div>
  );
}
