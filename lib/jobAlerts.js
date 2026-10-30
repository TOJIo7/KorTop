import { botTranslator } from "./botTranslator";
import { formatNumber, formatSalary } from "./format";
import { findRegion, regionName } from "./regions";
import { redis } from "./redis";
import { sendMessage, TelegramBlockedError } from "./telegram";
import { searchJobs } from "./trudvsem";

// Подписки на новые вакансии в Telegram.
// API «Работа России» отдаёт вакансии не по дате, поэтому «новые» — это вакансии из первой сотни
// результатов, опубликованные за последние 7 дней, которые бот этому человеку ещё не присылал.
// В Redis:
//   alerts:pending:<code> — поиск с сайта, ждёт, пока человек откроет бота (живёт сутки)
//   alerts:chat:<chatId>  — { locale, subs: [{ id, filters, seen: [id вакансий] }] }
//   alerts:chats          — множество chatId для ежедневной рассылки
const MAX_SUBS = 3; // больше трёх подписок — старая заменяется новой
const FRESH_DAYS = 7;
const MAX_JOBS_PER_MESSAGE = 5;
const MAX_SEEN = 500;
const PENDING_TTL = 24 * 3600;
const CONCURRENCY = 3; // как в /api/warm: больше API «Работа России» не выдерживает
const CHATS = "alerts:chats";
const pendingKey = (code) => `alerts:pending:${code}`;
const chatKey = (chatId) => `alerts:chat:${chatId}`;

// Только поля поиска, без страницы — по ним сравниваем подписки
export function alertFilters(filters) {
  return {
    text: filters.text ?? "",
    region: filters.region ?? "",
    housing: Boolean(filters.housing),
    foreign: Boolean(filters.foreign),
    salary: filters.salary ?? null,
  };
}

const filtersKey = (filters) => JSON.stringify(alertFilters(filters));

async function search(filters) {
  const { jobs } = await searchJobs({ ...alertFilters(filters), wide: true });
  return jobs;
}

// «грузчик · Москва · с жильём · от 60 000 ₽»
function describeSearch(filters, t, locale) {
  return [
    filters.text || t("bot.alerts.search.all"),
    filters.region ? regionName(findRegion(filters.region), locale) : t("bot.alerts.search.russia"),
    filters.housing && t("bot.alerts.search.housing"),
    filters.foreign && t("bot.alerts.search.foreign"),
    filters.salary && t("bot.alerts.search.salary", { value: formatNumber(filters.salary, locale) }),
  ]
    .filter(Boolean)
    .join(" · ");
}

// Ссылка на вакансию на нашем сайте; без SITE_URL — на оригинал trudvsem.ru
function jobLink(job, locale) {
  const site = process.env.SITE_URL;
  return site ? `${site}/${locale}/jobs/${job.id}` : job.url;
}

function jobsText(jobs, t, locale) {
  return jobs
    .map((job) =>
      t("bot.alerts.item", {
        title: job.title,
        salary: formatSalary(job, locale, (key, values) => t(`jobs.card.${key}`, values)),
        place: [job.employer, job.region].filter(Boolean).join(", "),
        url: jobLink(job, locale),
      }),
    )
    .join("\n\n");
}

// Не присланные ещё вакансии за последние FRESH_DAYS дней, сначала самые свежие
function freshJobs(jobs, seen) {
  const since = Date.now() - FRESH_DAYS * 86_400_000;
  return jobs
    .filter((job) => job.postedAt && Date.parse(job.postedAt) >= since && !seen.includes(job.id))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export async function getAlerts(chatId) {
  const raw = await redis("GET", chatKey(chatId));
  return raw ? JSON.parse(raw) : null;
}

async function saveAlerts(chatId, record) {
  if (record.subs.length === 0) return stopAlerts(chatId);
  await redis("SET", chatKey(chatId), JSON.stringify(record));
  await redis("SADD", CHATS, chatId);
}

export async function stopAlerts(chatId) {
  await redis("DEL", chatKey(chatId));
  await redis("SREM", CHATS, chatId);
}

// Поиск с сайта ждёт открытия бота. В ссылке перед кодом буква j, чтобы бот отличал его от дат документов
export async function createAlertPending(filters, locale) {
  const code = crypto.randomUUID().replaceAll("-", "");
  await redis("SET", pendingKey(code), JSON.stringify({ locale, filters: alertFilters(filters) }), "EX", PENDING_TTL);
  return `j${code}`;
}

// Человек открыл бота по ссылке: добавляем подписку к его чату. Такой же поиск второй раз не добавляется.
// Возвращает { text, subId } или null, если ссылка устарела
export async function claimAlertPending(code, chatId) {
  if (!/^[a-f0-9]{32}$/.test(code)) return null;
  const raw = await redis("GETDEL", pendingKey(code));
  if (!raw) return null;
  const { locale, filters } = JSON.parse(raw);

  const record = (await getAlerts(chatId)) ?? { subs: [] };
  record.locale = locale;
  let sub = record.subs.find((s) => filtersKey(s.filters) === filtersKey(filters));
  if (!sub) {
    sub = { id: crypto.randomUUID().slice(0, 6), filters, seen: [] };
    record.subs = [...record.subs, sub].slice(-MAX_SUBS);
  }
  await saveAlerts(chatId, record);

  const { t } = botTranslator(locale);
  return { text: t("bot.alerts.saved", { search: describeSearch(filters, t, locale) }), subId: sub.id };
}

// Сразу после подписки — 5 самых свежих вакансий по поиску, чтобы было видно, как это выглядит
export async function sendFirstJobs(chatId, subId) {
  const record = await getAlerts(chatId);
  const sub = record?.subs.find((s) => s.id === subId);
  if (!sub) return;
  const { t, locale } = botTranslator(record.locale);

  const jobs = (await search(sub.filters))
    .filter((job) => job.postedAt)
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .slice(0, MAX_JOBS_PER_MESSAGE);
  if (jobs.length === 0) return sendMessage(chatId, t("bot.alerts.noneNow"));

  await sendMessage(chatId, `${t("bot.alerts.now")}\n\n${jobsText(jobs, t, locale)}\n\n${t("bot.alerts.footer", { id: sub.id })}`);
  sub.seen = jobs.map((job) => job.id);
  await saveAlerts(chatId, record);
}

export async function alertsList(chatId) {
  const record = await getAlerts(chatId);
  const { t, locale } = botTranslator(record?.locale);
  if (!record?.subs.length) return null;
  const list = record.subs.map((s) => t("bot.alerts.listItem", { search: describeSearch(s.filters, t, locale), id: s.id })).join("\n");
  return t("bot.alerts.list", { list });
}

// /unsub_<id> → текст ответа или null, если такой подписки нет
export async function unsubscribe(chatId, subId) {
  const record = await getAlerts(chatId);
  const sub = record?.subs.find((s) => s.id === subId);
  if (!sub) return null;
  record.subs = record.subs.filter((s) => s !== sub);
  await saveAlerts(chatId, record);
  const { t, locale } = botTranslator(record.locale);
  return t("bot.alerts.unsubscribed", { search: describeSearch(sub.filters, t, locale) });
}

// Раз в день (Vercel Cron): каждый уникальный поиск запрашиваем один раз, потом раздаём подписчикам
export async function sendDueJobAlerts() {
  const chatIds = (await redis("SMEMBERS", CHATS)) ?? [];
  const records = new Map();
  for (const chatId of chatIds) {
    const record = await getAlerts(chatId);
    if (record) records.set(chatId, record);
    else await redis("SREM", CHATS, chatId);
  }

  const queue = [...new Map([...records.values()].flatMap((r) => r.subs).map((s) => [filtersKey(s.filters), s.filters]))];
  const results = new Map();
  async function worker() {
    while (queue.length) {
      const [key, filters] = queue.shift();
      results.set(key, await search(filters).catch(() => null));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  let sent = 0;
  let failed = 0;
  for (const [chatId, record] of records) {
    const { t, locale } = botTranslator(record.locale);
    try {
      for (const sub of record.subs) {
        const jobs = results.get(filtersKey(sub.filters));
        if (!jobs) continue; // API не ответил — попробуем завтра
        const fresh = freshJobs(jobs, sub.seen).slice(0, MAX_JOBS_PER_MESSAGE);
        if (fresh.length === 0) continue;
        const title = t("bot.alerts.new", { search: describeSearch(sub.filters, t, locale) });
        await sendMessage(chatId, `${title}\n\n${jobsText(fresh, t, locale)}\n\n${t("bot.alerts.footer", { id: sub.id })}`);
        sub.seen = [...sub.seen, ...fresh.map((job) => job.id)].slice(-MAX_SEEN);
        sent++;
      }
      await saveAlerts(chatId, record);
    } catch (error) {
      if (error instanceof TelegramBlockedError) await stopAlerts(chatId);
      else failed++;
    }
  }

  return { chats: records.size, searches: results.size, sent, failed };
}
