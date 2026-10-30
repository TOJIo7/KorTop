// Бот на своём компьютере: Telegram не достучится до localhost, поэтому этот скрипт сам
// забирает сообщения (getUpdates) и пересылает их в http://localhost:3000/api/telegram.
// Запуск рядом с npm run dev: npm run bot:dev
// Пока скрипт работает, вебхук отключён — после выкладки снова подключите: npm run bot:webhook -- https://<домен>
const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const local = process.env.LOCAL_URL ?? "http://localhost:3000";
if (!token || !secret) {
  console.error("Заполните TELEGRAM_BOT_TOKEN и TELEGRAM_WEBHOOK_SECRET в .env.local");
  process.exit(1);
}

const api = (method, params = {}) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());

await api("deleteWebhook");
console.log(`Слушаю бота и пересылаю в ${local}/api/telegram. Остановить: Ctrl+C`);

let offset = 0;
for (;;) {
  try {
    const { result = [] } = await api("getUpdates", { offset, timeout: 30, allowed_updates: ["message"] });
    for (const update of result) {
      offset = update.update_id + 1;
      console.log(`→ ${update.message?.text ?? "(не текст)"}`);
      await fetch(`${local}/api/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Telegram-Bot-Api-Secret-Token": secret },
        body: JSON.stringify(update),
      });
    }
  } catch (error) {
    console.error("Ошибка, повтор через 3 секунды:", error.message);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}
