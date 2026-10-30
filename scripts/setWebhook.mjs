// Подключить бота к выложенному сайту (один раз после деплоя):
// npm run bot:webhook -- https://<домен>
// Берёт TELEGRAM_BOT_TOKEN и TELEGRAM_WEBHOOK_SECRET из .env.local — те же значения должны быть в Vercel
const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const site = process.argv[2]?.replace(/\/$/, "");
if (!token || !secret || !site?.startsWith("https://")) {
  console.error("Нужно: TELEGRAM_BOT_TOKEN и TELEGRAM_WEBHOOK_SECRET в .env.local и адрес сайта: npm run bot:webhook -- https://<домен>");
  process.exit(1);
}

const api = (method, params) =>
  fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  }).then((res) => res.json());

console.log("setWebhook:", await api("setWebhook", { url: `${site}/api/telegram`, secret_token: secret, allowed_updates: ["message"] }));

// Меню команд в Telegram на двух языках
const commands = {
  ru: [
    { command: "subs", description: "Подписки на вакансии" },
    { command: "list", description: "Даты документов" },
    { command: "stop", description: "Отключить всё" },
  ],
  tg: [
    { command: "subs", description: "Обунаҳо ба вакансияҳо" },
    { command: "list", description: "Санаҳои ҳуҷҷатҳо" },
    { command: "stop", description: "Ҳамаашро хомӯш кардан" },
  ],
};
console.log("setMyCommands:", await api("setMyCommands", { commands: commands.tg }));
console.log("setMyCommands ru:", await api("setMyCommands", { commands: commands.ru, language_code: "ru" }));
