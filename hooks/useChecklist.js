"use client";

import { useCallback, useSyncExternalStore } from "react";

// Отметки выполненных шагов чек-листа документов в localStorage (D-2)
const KEY = "kortop:documents";
const EVENT = "kortop:documents-change";
const EMPTY = [];

let cachedRaw = null;
let cachedList = EMPTY;

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
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

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

export function useChecklist() {
  const done = useSyncExternalStore(subscribe, read, () => EMPTY);

  const toggle = useCallback((id) => {
    const list = read();
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Приватный режим — отметки не сохранятся, но страница работает
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { done, toggle };
}
