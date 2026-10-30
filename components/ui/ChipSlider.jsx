"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Лента чипсов без полосы прокрутки: пальцем — обычный свайп, мышью — перетаскивание и стрелки.
// children — элементы <li>
export default function ChipSlider({ children }) {
  const t = useTranslations("common");
  const ref = useRef(null);
  const drag = useRef(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  function updateEdges() {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft > 4, end: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 });
  }

  // ResizeObserver срабатывает и сразу при подключении — стрелки появятся без отдельного вызова
  useEffect(() => {
    const observer = new ResizeObserver(updateEdges);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  function scrollStep(direction) {
    const el = ref.current;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  // Перетаскивание только мышью: на телефоне браузер сам прокручивает с инерцией
  function onPointerDown(e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    delete ref.current.dataset.dragged;
    drag.current = { x: e.clientX, left: ref.current.scrollLeft, moved: false };
  }

  function onPointerMove(e) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 5) drag.current.moved = true;
    ref.current.scrollLeft = drag.current.left - dx;
  }

  function onPointerUp() {
    // Если тянули — следующий клик по ссылке не считаем переходом
    if (drag.current?.moved) ref.current.dataset.dragged = "true";
    drag.current = null;
  }

  function onClickCapture(e) {
    if (ref.current.dataset.dragged) {
      e.preventDefault();
      e.stopPropagation();
      delete ref.current.dataset.dragged;
    }
  }

  // Края плавно растворяются там, где есть что листать
  const mask = `linear-gradient(to right, ${edges.start ? "transparent" : "#000"}, #000 40px, #000 calc(100% - 40px), ${edges.end ? "transparent" : "#000"})`;

  return (
    <div className="relative">
      <ul
        ref={ref}
        onScroll={updateEdges}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        // Полоса прокрутки скрыта: scrollbar-none для новых браузеров, ::-webkit-scrollbar — для старых
        className="scrollbar-none [&::-webkit-scrollbar]:hidden -mx-4 flex gap-2 overflow-x-auto overscroll-x-contain px-4 py-1 select-none pointer-fine:cursor-grab"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        {children}
      </ul>
      {edges.start && <Arrow side="left" label={t("scrollBack")} onClick={() => scrollStep(-1)} />}
      {edges.end && <Arrow side="right" label={t("scrollForward")} onClick={() => scrollStep(1)} />}
    </div>
  );
}

function Arrow({ side, label, onClick }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-300 bg-card text-slate-800 shadow-[0_2px_0_var(--color-slate-300)] transition-colors hover:border-slate-900 pointer-fine:flex ${
        side === "left" ? "-left-2" : "-right-2"
      }`}
    >
      <Icon size={20} aria-hidden="true" />
    </button>
  );
}
