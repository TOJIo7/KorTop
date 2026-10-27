import { cacheLife } from "next/cache";
import { normalizeJob, parseJobId } from "./normalizeJob";
import { findRegion } from "./regions";

// API «Работа России»: https://trudvsem.ru/opendata/api (ключ не нужен).
// Выводы проверки API — в docs/samples/README.md
const BASE_URL = "https://opendata.trudvsem.ru/api/v1/vacancies";

// API отвечает 11–18 секунд, поэтому ждём до 25 секунд (10 с из PRD не хватает)
const TIMEOUT_MS = 25_000;

export const PAGE_SIZE = 20;
// Фильтра по зарплате в API нет: при «зарплата от» берём страницу побольше и отбираем сами
const SALARY_PAGE_SIZE = 100;

async function request(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`trudvsem ${res.status}`);
  return res.json();
}

/**
 * Поиск вакансий. Результат кэшируется на час (cacheLife "hours").
 * page начинается с 1; в API offset — это номер страницы с нуля.
 * Возвращает { jobs, total, pageSize, fetchedAt }.
 */
export async function searchJobs({ text = "", region = "", housing = false, salary = null, page = 1 }) {
  "use cache";
  cacheLife("hours");

  const regionCode = findRegion(region)?.trudvsemCode;
  const pageSize = salary ? SALARY_PAGE_SIZE : PAGE_SIZE;
  const url = new URL(regionCode ? `${BASE_URL}/region/${regionCode}` : BASE_URL);
  url.searchParams.set("limit", String(pageSize));
  url.searchParams.set("offset", String(page - 1));
  if (text) url.searchParams.set("text", text);
  if (housing) url.searchParams.set("accommodation", "true");

  const data = await request(url);
  const items = data?.results?.vacancies ?? [];
  let jobs = items
    .map((item) => normalizeJob(item.vacancy, { housing: housing || null }))
    .filter(Boolean);

  if (salary) {
    jobs = jobs.filter((job) => (job.salaryTo ?? job.salaryFrom ?? 0) >= salary);
  }

  return {
    jobs,
    total: Number(data?.meta?.total) || 0,
    pageSize,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Одна вакансия по нашему id. null — если вакансия не найдена или снята.
 */
export async function getJob(id) {
  "use cache";
  cacheLife("hours");

  const parsed = parseJobId(id);
  if (!parsed) return null;

  const data = await request(`${BASE_URL}/vacancy/${parsed.companyCode}/${parsed.vacancyId}`);
  const vacancy = data?.results?.vacancies?.[0]?.vacancy;
  return vacancy ? { job: normalizeJob(vacancy), fetchedAt: new Date().toISOString() } : null;
}
