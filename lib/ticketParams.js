import { regions } from "./regions";

// Направления: города России с аэропортом из data/regions.json, без повторов
// (у Москвы и Московской области один код MOW)
export const destinations = regions
  .filter((r) => r.airport)
  .filter((r, i, all) => all.findIndex((x) => x.airport === r.airport) === i);

// Ближайшие 6 месяцев в формате "2026-11"; сегодня передаём снаружи
export function nextMonths(today, count = 6) {
  const [y, m] = today.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 + i, 1));
    return d.toISOString().slice(0, 7);
  });
}

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

// ?from=DYU&to=MOW&month=2026-11 → проверенные значения (по умолчанию Душанбе → Москва, этот месяц)
export function parseTicketParams(searchParams, months) {
  const from = first(searchParams.from);
  const to = first(searchParams.to);
  const month = first(searchParams.month);
  return {
    from: ["DYU", "LBD"].includes(from) ? from : "DYU",
    to: destinations.some((d) => d.airport === to) ? to : "MOW",
    month: months.includes(month) ? month : months[0],
  };
}
