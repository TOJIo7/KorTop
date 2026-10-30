import { handleBotMessage } from "@/lib/telegramBot";

// После ответа бот ещё ищет вакансии для новой подписки (after), API отвечает до 25 секунд
export const maxDuration = 60;

// Вебхук бота: сюда Telegram присылает сообщения людей.
// Подключается один раз после выкладки: npm run bot:webhook -- https://<домен>
export async function POST(request) {
  // Telegram подписывает запросы секретом, который мы передали в setWebhook
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || request.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const update = await request.json();
    await handleBotMessage(update.message);
  } catch {
    // Всегда 200: иначе Telegram будет присылать то же сообщение снова и снова
  }
  return new Response("ok");
}
