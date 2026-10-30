import { botTranslator } from "./botTranslator";
import { formatDate } from "./format";
import { redis } from "./redis";
import { sendMessage, TelegramBlockedError } from "./telegram";

// Напоминания о сроках документов в Telegram.
// Даты вводит сам человек — сайт ничего не придумывает и не считает сроки по закону.
// В Redis:
//   reminders:pending:<code> — даты с сайта, ждут, пока человек откроет бота (живут сутки)
//   reminders:chat:<chatId>  — { locale, reminders: [{ kind, date, sent: [3, 1] }] }
//   reminders:chats          — множество chatId для ежедневной проверки
export const REMINDER_KINDS = ["patentPayment", "patentEnd", "registration"];
const REMIND_DAYS = [3, 1, 0]; // за сколько дней до срока писать
const PENDING_TTL = 24 * 3600;
const MAX_DAYS_AHEAD = 2 * 366;
const CHATS = "reminders:chats";
const pendingKey = (code) => `reminders:pending:${code}`;
const chatKey = (chatId) => `reminders:chat:${chatId}`;

// Сроки в России — считаем дни по Москве
function todayMoscow() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow" }).format(new Date());
}

function daysBetween(from, to) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  // 2026-02-31 Date.parse молча превращает в 3 марта — сверяем обратно
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Из формы { patentPayment: "2026-11-05", ... } → [{ kind, date }]. Пустые и прошедшие даты отбрасываем
export function parseReminders(input) {
  const today = todayMoscow();
  return REMINDER_KINDS.flatMap((kind) => {
    const date = input?.[kind];
    if (!isValidDate(date)) return [];
    const days = daysBetween(today, date);
    return days >= 0 && days <= MAX_DAYS_AHEAD ? [{ kind, date }] : [];
  });
}

// Сохраняем даты до открытия бота. code уходит в ссылку t.me/<бот>?start=<code>
export async function createPending(reminders, locale) {
  const code = crypto.randomUUID().replaceAll("-", "");
  await redis("SET", pendingKey(code), JSON.stringify({ locale, reminders }), "EX", PENDING_TTL);
  return code;
}

// Человек открыл бота по ссылке: переносим даты к его чату (старые даты заменяются)
export async function claimPending(code, chatId) {
  if (!/^[a-f0-9]{32}$/.test(code)) return null;
  const raw = await redis("GETDEL", pendingKey(code));
  if (!raw) return null;
  const { locale, reminders } = JSON.parse(raw);
  const record = { locale, reminders: reminders.map((r) => ({ ...r, sent: [] })) };
  await redis("SET", chatKey(chatId), JSON.stringify(record));
  await redis("SADD", CHATS, chatId);
  return record;
}

export async function getChatReminders(chatId) {
  const raw = await redis("GET", chatKey(chatId));
  return raw ? JSON.parse(raw) : null;
}

export async function stopReminders(chatId) {
  await redis("DEL", chatKey(chatId));
  await redis("SREM", CHATS, chatId);
}

// «• оплата патента — до 5 ноября 2026 г.» построчно
export function remindersList(record) {
  const { t, locale } = botTranslator(record.locale);
  return record.reminders
    .map((r) => t("bot.item", { kind: t(`bot.kinds.${r.kind}`), date: formatDate(r.date, locale) }))
    .join("\n");
}

// Раз в день (Vercel Cron): пишем тем, у кого срок через 3 дня, завтра или сегодня
export async function sendDueReminders() {
  const today = todayMoscow();
  const chatIds = (await redis("SMEMBERS", CHATS)) ?? [];
  let sent = 0;
  let failed = 0;

  for (const chatId of chatIds) {
    try {
      const record = await getChatReminders(chatId);
      if (!record) {
        await redis("SREM", CHATS, chatId);
        continue;
      }
      const { t, locale } = botTranslator(record.locale);

      for (const r of record.reminders) {
        const days = daysBetween(today, r.date);
        // Ближайший порог; если проверка пропустила день, напомним с опозданием, но один раз
        const step = REMIND_DAYS.filter((d) => days >= 0 && days <= d).at(-1);
        if (step === undefined || r.sent.includes(step)) continue;
        const text = `${t("bot.remind", { days, kind: t(`bot.kinds.${r.kind}`), date: formatDate(r.date, locale) })}\n\n${t("bot.remindHint")}`;
        await sendMessage(chatId, text);
        r.sent = REMIND_DAYS.filter((d) => d >= step);
        sent++;
      }

      // Прошедшие сроки больше не нужны; если ничего не осталось — убираем чат
      record.reminders = record.reminders.filter((r) => daysBetween(today, r.date) >= 0);
      if (record.reminders.length) await redis("SET", chatKey(chatId), JSON.stringify(record));
      else await stopReminders(chatId);
    } catch (error) {
      if (error instanceof TelegramBlockedError) await stopReminders(chatId);
      else failed++;
    }
  }

  return { chats: chatIds.length, sent, failed };
}
