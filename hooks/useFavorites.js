"use client";

import { useCallback, useSyncExternalStore } from "react";

// Избранное хранится в localStorage браузера (без регистрации).
// Храним КОПИИ вакансий, чтобы избранное открывалось, даже если вакансию сняли (V-11)
const KEY = "kortop:favorites";
const EVENT = "kortop:favorites-change";
const EMPTY = [];

let cachedRaw = null;
let cachedList = EMPTY;

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    // Пересобираем массив только когда данные изменились, иначе React зациклится
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const parsed = raw ? JSON.parse(raw) : [];
      cachedList = Array.isArray(parsed) ? parsed : EMPTY;
    }
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

function write(list) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Приватный режим или переполнено — просто не сохраняем
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback) {
  // storage — изменения из других вкладок, EVENT — из этой вкладки
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

export function useFavorites() {
  // На сервере избранного нет — пустой список
  const favorites = useSyncExternalStore(subscribe, read, () => EMPTY);

  const isFavorite = useCallback((id) => favorites.some((f) => f.job.id === id), [favorites]);

  const toggle = useCallback((job) => {
    const list = read();
    const next = list.some((f) => f.job.id === job.id)
      ? list.filter((f) => f.job.id !== job.id)
      : [{ job, savedAt: new Date().toISOString() }, ...list];
    write(next);
  }, []);

  return { favorites, isFavorite, toggle };
}
