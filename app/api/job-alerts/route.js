import { routing } from "@/i18n/routing";
import { parseJobFilters } from "@/lib/jobFilters";
import { hasRedis } from "@/lib/redis";
import { botStartUrl, hasTelegram } from "@/lib/telegram";
import { createAlertPending } from "@/lib/jobAlerts";

// Кнопка «Подписаться»: { locale, query: { text, region, housing, ... } } → { url } ссылка на бота.
// query — те же параметры, что в адресе /jobs, поэтому проверяем их тем же parseJobFilters
export async function POST(request) {
  if (!hasRedis() || !hasTelegram()) {
    return Response.json({ error: "notConfigured" }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "failed" }, { status: 400 });
  }

  const filters = parseJobFilters(body?.query ?? {});
  const locale = routing.locales.includes(body?.locale) ? body.locale : routing.defaultLocale;

  try {
    const code = await createAlertPending(filters, locale);
    return Response.json({ url: botStartUrl(code) });
  } catch {
    return Response.json({ error: "failed" }, { status: 502 });
  }
}
