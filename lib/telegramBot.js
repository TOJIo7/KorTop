import { after } from "next/server";
import { botTranslator } from "./botTranslator";
import { alertsList, claimAlertPending, getAlerts, sendFirstJobs, stopAlerts, unsubscribe } from "./jobAlerts";
import { claimPending, getChatReminders, remindersList, stopReminders } from "./reminders";
import { sendMessage } from "./telegram";

// Ответы бота на сообщения.
// /start j<код> — подписка на вакансии, /start <код> — даты документов, /start — приветствие,
// /subs и /unsub_<id> — подписки, /list — даты, /stop — отключить всё
export async function handleBotMessage(message) {
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();
  if (!chatId || !text) return;

  const [command, arg] = text.split(/\s+/);
  const reminders = await getChatReminders(chatId);
  // Язык: сохранённый с сайта, иначе по языку Telegram (по умолчанию таджикский)
  const savedLocale = reminders?.locale ?? (await getAlerts(chatId))?.locale;
  const { t } = botTranslator(savedLocale ?? (message.from?.language_code === "ru" ? "ru" : "tg"));

  if (command === "/start" && arg?.startsWith("j")) {
    const claimed = await claimAlertPending(arg.slice(1), chatId);
    if (!claimed) return sendMessage(chatId, t("bot.alerts.expired"));
    await sendMessage(chatId, claimed.text);
    // Поиск идёт до 25 секунд — отвечаем Telegram сразу, а вакансии присылаем после ответа
    after(() => sendFirstJobs(chatId, claimed.subId).catch(() => {}));
    return;
  }

  if (command === "/start" && arg) {
    const record = await claimPending(arg, chatId);
    if (!record) return sendMessage(chatId, t("bot.expired"));
    return sendMessage(chatId, botTranslator(record.locale).t("bot.saved", { list: remindersList(record) }));
  }

  if (command === "/start") {
    const site = process.env.SITE_URL;
    return sendMessage(chatId, site ? `${t("bot.welcome")}\n\n${t("bot.welcomeLink", { url: site })}` : t("bot.welcome"));
  }

  if (command === "/subs") {
    return sendMessage(chatId, (await alertsList(chatId)) ?? t("bot.alerts.empty"));
  }

  if (command.startsWith("/unsub_")) {
    return sendMessage(chatId, (await unsubscribe(chatId, command.slice("/unsub_".length))) ?? t("bot.alerts.notFound"));
  }

  if (command === "/list") {
    return sendMessage(chatId, reminders?.reminders.length ? t("bot.list", { list: remindersList(reminders) }) : t("bot.empty"));
  }

  if (command === "/stop") {
    await stopReminders(chatId);
    await stopAlerts(chatId);
    return sendMessage(chatId, t("bot.stopped"));
  }

  return sendMessage(chatId, t("bot.help"));
}
