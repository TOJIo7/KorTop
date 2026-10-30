import { cacheLife } from "next/cache";
import { normalizeJob, parseJobId } from "./normalizeJob";
import { findRegion } from "./regions";

// API «Работа России»: https://trudvsem.ru/opendata/api (ключ не нужен).
// Выводы проверки API — в docs/samples/README.md
const BASE_URL = "https://opendata.trudvsem.ru/api/v1/vacancies";

// API отвечает 11–18 секунд, поэтому ждём до 25 секунд (10 с из PRD не хватает)
const TIMEOUT_MS = 25_000;

export const PAGE_SIZE = 20;
// Фильтров по зарплате и «для иностранцев» в API нет: берём страницу побольше и отбираем сами
const FILTER_PAGE_SIZE = 100;

async function request(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`trudvsem ${res.status}`);
  return res.json();
}

/**
 * Одна страница API как есть (уже в нашем формате).
 * "use cache: remote" — кэш общий для всех серверов Vercel, а не в памяти одного:
 * иначе почти каждый посетитель ждал бы ответа API по 15 секунд.
 * В ключ кэша входят только параметры API, фильтры по зарплате сюда не попадают.
 * Вызывать только через searchJobs: он всегда передаёт все поля в одном виде,
 * иначе {region: "66"} и {text: "", region: "66", ...} дадут разные ключи кэша.
 */
export async function fetchVacancyPage({ text = "", region = "", housing = false, page = 1, pageSize = PAGE_SIZE }) {
  "use cache: remote";
  cacheLife("hours");

  const regionCode = findRegion(region)?.trudvsemCode;
  const url = new URL(regionCode ? `${BASE_URL}/region/${regionCode}` : BASE_URL);
  url.searchParams.set("limit", String(pageSize));
  // В API offset — номер страницы с нуля
  url.searchParams.set("offset", String(page - 1));
  if (text) url.searchParams.set("text", text);
  if (housing) url.searchParams.set("accommodation", "true");

  const data = await request(url);
  const jobs = (data?.results?.vacancies ?? [])
    .map((item) => normalizeJob(item.vacancy, { housing: housing || null }))
    .filter(Boolean);

  return { jobs, total: Number(data?.meta?.total) || 0, fetchedAt: new Date().toISOString() };
}

/**
 * Поиск вакансий с нашими фильтрами. page начинается с 1.
 * wide — сразу страница на 100 вакансий (подпискам в Telegram нужно больше, чем 20 на сайте).
 * Возвращает { jobs, total, pageSize, fetchedAt }; total — сколько нашёл API до наших фильтров.
 */
export async function searchJobs({ text = "", region = "", housing = false, salary = null, foreign = false, page = 1, wide = false }) {
  const filtering = Boolean(salary || foreign);
  const pageSize = filtering || wide ? FILTER_PAGE_SIZE : PAGE_SIZE;
  const result = await fetchVacancyPage({ text, region, housing, page, pageSize });

  let jobs = result.jobs;
  if (salary) jobs = jobs.filter((job) => (job.salaryTo ?? job.salaryFrom ?? 0) >= salary);
  if (foreign) jobs = jobs.filter((job) => job.forForeigners);

  return { ...result, jobs, pageSize };
}

/**
 * Одна вакансия по нашему id. null — если вакансия не найдена или снята.
 */
export async function getJob(id) {
  "use cache: remote";
  cacheLife("hours");

  const parsed = parseJobId(id);
  if (!parsed) return null;

  const data = await request(`${BASE_URL}/vacancy/${parsed.companyCode}/${parsed.vacancyId}`);
  const vacancy = data?.results?.vacancies?.[0]?.vacancy;
  return vacancy ? { job: normalizeJob(vacancy), fetchedAt: new Date().toISOString() } : null;
}
