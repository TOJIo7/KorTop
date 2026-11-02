"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { formatNumber } from "@/lib/format";

const DURATION_MS = 700;

// Число «набегает» до значения. При «уменьшить движение» сразу показывает итог
export default function CountUp({ value }) {
  const locale = useLocale();
  const [shown, setShown] = useState(value);
  const current = useRef(0); // при открытии страницы набегает с нуля

  useEffect(() => {
    const from = current.current;
    if (from === value) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const started = performance.now();
    let frame;

    function tick(now) {
      const progress = reduceMotion ? 1 : Math.min((now - started) / DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      current.current = Math.round(from + (value - from) * eased);
      setShown(current.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className="tabular-nums">{formatNumber(shown, locale)}</span>;
}
