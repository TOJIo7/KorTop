// Telegram Bot API: https://core.telegram.org/bots/api
// Бот создаётся в @BotFather. Токен только на сервере: process.env.TELEGRAM_BOT_TOKEN
const API = "https://api.telegram.org";
const TIMEOUT_MS = 10_000;

export function hasTelegram() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_USERNAME);
}

// Ссылка, которая открывает бота и передаёт ему code: t.me/<бот>?start=<code>
export function botStartUrl(code) {
  return `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${code}`;
}

export class TelegramBlockedError extends Error {}

export async function sendMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN не задан");

  const res = await fetch(`${API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, link_preview_options: { is_disabled: true } }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  // 403 — человек заблокировал бота: напоминания ему больше не нужны
  if (res.status === 403) throw new TelegramBlockedError(`chat ${chatId} заблокировал бота`);
  if (!res.ok) throw new Error(`telegram ${res.status}`);
}
