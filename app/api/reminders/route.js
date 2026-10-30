import { routing } from "@/i18n/routing";
import { hasRedis } from "@/lib/redis";
import { botStartUrl, hasTelegram } from "@/lib/telegram";
import { createPending, parseReminders } from "@/lib/reminders";

// Форма напоминаний: { locale, dates: { patentPayment: "2026-11-05", ... } } → { url } ссылка на бота
export async function POST(request) {
  if (!hasRedis() || !hasTelegram()) {
    return Response.json({ error: "notConfigured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "empty" }, { status: 400 });
  }

  const reminders = parseReminders(body?.dates);
  if (reminders.length === 0) return Response.json({ error: "empty" }, { status: 400 });
  const locale = routing.locales.includes(body?.locale) ? body.locale : routing.defaultLocale;

  try {
    const code = await createPending(reminders, locale);
    return Response.json({ url: botStartUrl(code) });
  } catch {
    return Response.json({ error: "failed" }, { status: 502 });
  }
}
