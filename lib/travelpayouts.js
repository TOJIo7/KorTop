import { cacheLife } from "next/cache";

// Aviasales Data API через Travelpayouts: https://support.travelpayouts.com/hc/en-us/articles/203956163
// Цены берутся из кэша недавних поисков (хранятся до 7 дней), поэтому пишем «от … ₽».
// Токен только на сервере: process.env.TRAVELPAYOUTS_TOKEN (в браузер не уходит)
const API_URL = "https://api.travelpayouts.com/aviasales/v3/grouped_prices";
const AVIASALES = "https://www.aviasales.ru";
const TIMEOUT_MS = 10_000;

export const ORIGINS = ["DYU", "LBD"]; // Душанбе, Худжанд

export function hasTicketsToken() {
  return Boolean(process.env.TRAVELPAYOUTS_TOKEN);
}

// Партнёрская ссылка на Aviasales: marker — ваш ID в Travelpayouts
function withMarker(url) {
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  if (marker) url.searchParams.set("marker", marker);
  return url.toString();
}

// Ссылка «Смотреть на Aviasales» для направления, даже если цен нет (T-4)
export function aviasalesSearchUrl(origin, destination) {
  const url = new URL(AVIASALES);
  url.searchParams.set("origin_iata", origin);
  url.searchParams.set("destination_iata", destination);
  return withMarker(url);
}

/**
 * Самые дешёвые даты вылета за месяц (month = "2026-11").
 * Возвращает { prices: [{ date, price, transfers, airline, url }], fetchedAt }.
 * Кэш 6 часов. Без токена или при ошибке API — исключение.
 */
export async function getCheapestPrices({ origin, destination, month }) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 6 * 3600, expire: 24 * 3600 });

  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) throw new Error("TRAVELPAYOUTS_TOKEN не задан");

  const url = new URL(API_URL);
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("departure_at", month);
  url.searchParams.set("group_by", "departure_at");
  url.searchParams.set("currency", "rub");

  const res = await fetch(url, {
    headers: { "X-Access-Token": token, "Accept-Encoding": "gzip, deflate" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`travelpayouts ${res.status}`);
  const body = await res.json();
  if (body.success === false) throw new Error(`travelpayouts: ${body.error}`);

  // data бывает объектом { "2026-11-05": {...} } или массивом — берём значения в обоих случаях
  const prices = Object.values(body.data ?? {})
    .filter((item) => item?.price > 0 && item?.departure_at)
    .map((item) => ({
      date: item.departure_at.slice(0, 10),
      price: item.price,
      transfers: Number.isInteger(item.transfers) ? item.transfers : null,
      airline: item.airline ?? null,
      url: item.link ? withMarker(new URL(item.link, AVIASALES)) : aviasalesSearchUrl(origin, destination),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return { prices, fetchedAt: new Date().toISOString() };
}
