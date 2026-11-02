"use client";

import { useEffect, useRef, useState } from "react";

const ZOOM_MS = 650;
const MIN_VIEW_WIDTH = 130; // чтобы Москва не заняла весь экран
const SELECTED = "var(--color-accent-500)";

// Чем больше вакансий, тем темнее индиго. Порог — «меньше стольких вакансий»
export const BUCKETS = [
  { below: 500, color: "#dce1f1" },
  { below: 2000, color: "#a9b4e0" },
  { below: 5000, color: "#6c7dc9" },
  { below: 15000, color: "#34479f" },
  { below: Infinity, color: "#151f4a" },
];

function fillOf(count) {
  if (count === null) return "var(--color-slate-200)";
  return BUCKETS.find((bucket) => count < bucket.below).color;
}

// Контуры лежат в public/region-map.json и грузятся отдельно: страница остаётся лёгкой.
// Клик работает пальцем и мышью; с клавиатуры регион выбирают в списке рядом (RegionExplorer)
export default function RegionMap({ shapes, counts, selectedId, onSelect, onHover, label }) {
  const svg = useRef(null);
  const paths = useRef(new Map());
  const view = useRef(null);
  const [viewBox, setViewBox] = useState(`0 0 ${shapes.width} ${shapes.height}`);

  // Плавно приближаем выбранный регион; без выбора — вся Россия
  useEffect(() => {
    const whole = [0, 0, shapes.width, shapes.height];
    const box = paths.current.get(selectedId)?.getBBox();
    let target = whole;
    if (box) {
      // Не шире всей карты и не за её краями: большой регион не должен отдалять карту
      const width = Math.min(Math.max(box.width * 1.5, box.height * 1.5 * (shapes.width / shapes.height), MIN_VIEW_WIDTH), shapes.width);
      const height = width * (shapes.height / shapes.width);
      const clamp = (value, max) => Math.min(Math.max(value, 0), max);
      target = [
        clamp(box.x + box.width / 2 - width / 2, shapes.width - width),
        clamp(box.y + box.height / 2 - height / 2, shapes.height - height),
        width,
        height,
      ];
    }

    const from = view.current ?? whole;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let frame;
    function tick(now) {
      const progress = reduceMotion ? 1 : Math.min((now - started) / ZOOM_MS, 1);
      const eased = progress < 0.5 ? 2 * progress ** 2 : 1 - (-2 * progress + 2) ** 2 / 2;
      view.current = from.map((value, i) => value + (target[i] - value) * eased);
      setViewBox(view.current.join(" "));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [selectedId, shapes]);

  // Выбранный регион рисуем последним, иначе его обводку перекроют соседи
  const ordered = [...shapes.regions].sort((a, b) => Number(a.id === selectedId) - Number(b.id === selectedId));

  return (
    <svg ref={svg} viewBox={viewBox} role="img" aria-label={label} className="block h-auto w-full touch-manipulation">
      {/* Подложка цветом региона: закрывает щели между соседями, оставшиеся от упрощения границ */}
      <g aria-hidden="true" pointerEvents="none">
        {ordered.map((region) => (
          <path
            key={region.id}
            d={region.d}
            fill="none"
            stroke={region.id === selectedId ? SELECTED : fillOf(counts[region.id] ?? null)}
            strokeWidth="4"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="map-region"
            style={{ animationDelay: `${parseFloat(region.d.slice(1)) * 1.1}ms` }}
          />
        ))}
      </g>
      {ordered.map((region) => (
        <path
          key={region.id}
          ref={(node) => {
            if (node) paths.current.set(region.id, node);
            else paths.current.delete(region.id);
          }}
          d={region.d}
          fill={region.id === selectedId ? SELECTED : fillOf(counts[region.id] ?? null)}
          stroke="var(--color-card)"
          strokeWidth="0.6"
          vectorEffect="non-scaling-stroke"
          className="map-region cursor-pointer outline-none transition-[fill] duration-200 hover:brightness-110"
          // Волна с запада на восток: x первой точки контура — от 0 до 1000
          style={{ animationDelay: `${parseFloat(region.d.slice(1)) * 1.1}ms` }}
          onClick={() => onSelect(region.id)}
          onPointerEnter={() => onHover(region.id)}
          onPointerLeave={() => onHover(null)}
        />
      ))}
    </svg>
  );
}
