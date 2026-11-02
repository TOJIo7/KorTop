"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatNumber, formatSalary } from "@/lib/format";

const API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;
const RUSSIA = { center: [95, 62], zoom: 3 };
const FLIGHT = { duration: 2000, easing: "ease-in-out" };
const MIN_SPAN = 0.02; // в градусах: чтобы карта не приближалась к одной точке до уровня дома
const PIN_STYLE = "flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-white font-bold text-white shadow-md";

export const hasYandexMaps = Boolean(API_KEY);

// Скрипт Яндекса грузим один раз и только когда карта нужна: на бесплатном ключе есть условия по запросам.
// Кластеризатор — отдельный пакет, как в примере из документации JS API
let loading = null;
function loadYandexMaps() {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${API_KEY}&lang=ru_RU`;
    script.onload = () => {
      window.ymaps3.ready
        .then(() => {
          window.ymaps3.import.registerCdn("https://cdn.jsdelivr.net/npm/{package}", ["@yandex/ymaps3-clusterer@0.0"]);
          return window.ymaps3.import("@yandex/ymaps3-clusterer");
        })
        .then(resolve, reject);
    };
    script.onerror = reject;
    document.head.append(script);
  }).catch((error) => {
    loading = null; // следующая попытка загрузит скрипт заново
    throw error;
  });
  return loading;
}

function boundsOf(points) {
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  const padLng = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 0.1, MIN_SPAN);
  const padLat = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.1, MIN_SPAN);
  return [
    [Math.min(...lngs) - padLng, Math.min(...lats) - padLat],
    [Math.max(...lngs) + padLng, Math.max(...lats) + padLat],
  ];
}

// Значок на карте — обычная кнопка: кружок с числом вакансий
function pinElement(count, size, color, label, onClick) {
  const pin = document.createElement("button");
  pin.type = "button";
  pin.className = `${PIN_STYLE} ${color}`;
  pin.style.width = pin.style.height = `${size}px`;
  pin.textContent = count;
  pin.setAttribute("aria-label", label);
  pin.addEventListener("click", onClick);
  return pin;
}

// Настоящая карта Яндекса с вакансиями выбранного региона. Показываем только вакансии с координатами из API
export default function YandexJobsMap({ regionId, regionName }) {
  const t = useTranslations("map.yandex");
  const tCard = useTranslations("jobs.card");
  const locale = useLocale();
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [engine, setEngine] = useState(null); // { ymaps, clusterer }, когда скрипт загружен
  const [engineFailed, setEngineFailed] = useState(false);
  const [result, setResult] = useState(null); // { regionId, places, total } или { regionId, failed }
  const [selection, setSelection] = useState(null); // { regionId, placeId }

  useEffect(() => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [regionId]);

  useEffect(() => {
    let cancelled = false;
    let map = null;
    loadYandexMaps()
      .then((clusterer) => {
        if (cancelled) return;
        const ymaps = window.ymaps3;
        map = new ymaps.YMap(containerRef.current, { location: RUSSIA }, [
          new ymaps.YMapDefaultSchemeLayer({}),
          new ymaps.YMapDefaultFeaturesLayer({}),
        ]);
        mapRef.current = map;
        setEngine({ ymaps, clusterer });
      })
      .catch(() => {
        if (!cancelled) setEngineFailed(true);
      });
    return () => {
      cancelled = true;
      map?.destroy();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/map-jobs?region=${regionId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`map-jobs ${res.status}`);
        return res.json();
      })
      .then((data) => setResult({ regionId, places: data.places, total: data.total }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ regionId, failed: true });
      });
    return () => controller.abort();
  }, [regionId]);

  const current = result?.regionId === regionId ? result : null;
  const places = useMemo(() => current?.places ?? null, [current]);
  const selected = selection?.regionId === regionId ? places?.find((place) => place.id === selection.placeId) ?? null : null;

  // Точки ставим, когда готовы и карта, и данные. Камера при этом летит к региону
  useEffect(() => {
    const map = mapRef.current;
    if (!engine || !map || !places?.length) return;

    const { ymaps, clusterer: { YMapClusterer, clusterByGrid } } = engine;
    const features = places.map((place) => ({
      type: "Feature",
      id: place.id,
      geometry: { type: "Point", coordinates: [place.lng, place.lat] },
      properties: { place },
    }));

    const layer = new YMapClusterer({
      method: clusterByGrid({ gridSize: 64 }),
      features,
      marker: (feature) => {
        const { place } = feature.properties;
        const pin = pinElement(place.jobs.length, 36, "bg-brand-700", t("pinLabel", { count: place.jobs.length }), () => {
          setSelection({ regionId, placeId: place.id });
        });
        return new ymaps.YMapMarker({ coordinates: feature.geometry.coordinates }, pin);
      },
      cluster: (coordinates, group) => {
        const count = group.reduce((sum, feature) => sum + feature.properties.place.jobs.length, 0);
        const pin = pinElement(count, 44, "bg-accent-600", t("groupLabel", { count }), () => {
          map.update({ location: { bounds: boundsOf(group.map((feature) => feature.geometry.coordinates)), ...FLIGHT } });
        });
        return new ymaps.YMapMarker({ coordinates }, pin);
      },
    });

    map.addChild(layer);
    map.update({ location: { bounds: boundsOf(features.map((feature) => feature.geometry.coordinates)), ...FLIGHT } });
    return () => map.removeChild(layer);
  }, [engine, places, regionId, t]);

  const shown = places?.reduce((sum, place) => sum + place.jobs.length, 0) ?? 0;

  return (
    <section ref={sectionRef} className="card flex scroll-mt-20 flex-col gap-3 p-3 sm:p-5">
      <h2 className="text-xl">{t("title", { region: regionName })}</h2>

      {engineFailed ? (
        <p role="alert" className="rounded-lg bg-accent-100 p-4 text-accent-800">{t("mapError")}</p>
      ) : (
        <div ref={containerRef} className="h-[60vh] max-h-160 min-h-80 w-full overflow-hidden rounded-lg bg-slate-100" />
      )}

      {!engineFailed && (
        <div aria-live="polite">
          {!current && <p className="text-slate-600">{t("loading")}</p>}
          {current?.failed && <p role="alert" className="text-accent-800">{t("jobsError")}</p>}
          {places?.length === 0 && <p className="text-slate-600">{t("empty")}</p>}
          {shown > 0 && <p className="text-sm text-slate-600">{t("shown", { shown: formatNumber(shown, locale), total: formatNumber(current.total, locale) })}</p>}
        </div>
      )}

      {engineFailed ? null : selected ? (
        <div className="flex flex-col gap-1 border-t border-slate-200 pt-3">
          {selected.address && (
            <p className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> {selected.address}
            </p>
          )}
          <ul className="flex flex-col">
            {selected.jobs.map((job) => (
              <li key={job.id}>
                <Link href={`/jobs/${job.id}`} className="flex min-h-11 flex-col justify-center rounded-md py-2 hover:bg-slate-100">
                  <span className="font-semibold text-brand-700">{job.title}</span>
                  {job.employer && <span className="text-sm text-slate-600">{job.employer}</span>}
                  <span className="money text-slate-900">{formatSalary(job, locale, tCard)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        shown > 0 && <p className="text-slate-600">{t("prompt")}</p>
      )}
    </section>
  );
}
