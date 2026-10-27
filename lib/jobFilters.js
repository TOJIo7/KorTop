import { findRegion } from "./regions";

// Фильтры вакансий живут в адресе: /jobs?text=грузчик&region=77&housing=1&salary=60000&page=2
// Так ссылкой с фильтрами можно поделиться (V-7)

const MAX_TEXT = 100;

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseJobFilters(searchParams = {}) {
  const text = (first(searchParams.text) ?? "").trim().slice(0, MAX_TEXT);
  const regionId = first(searchParams.region);
  const salary = Number.parseInt(first(searchParams.salary), 10);
  const page = Number.parseInt(first(searchParams.page), 10);

  return {
    text,
    region: findRegion(regionId) ? regionId : "",
    housing: first(searchParams.housing) === "1",
    salary: Number.isFinite(salary) && salary > 0 ? salary : null,
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

// Обратно в query для ссылок; пустые значения не пишем, чтобы адрес был коротким
export function toJobsQuery(filters) {
  const query = {};
  if (filters.text) query.text = filters.text;
  if (filters.region) query.region = filters.region;
  if (filters.housing) query.housing = "1";
  if (filters.salary) query.salary = String(filters.salary);
  if (filters.page && filters.page > 1) query.page = String(filters.page);
  return query;
}

export function hasActiveFilters(filters) {
  return Boolean(filters.text || filters.region || filters.housing || filters.salary);
}
