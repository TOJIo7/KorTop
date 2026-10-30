import { hasRedis } from "@/lib/redis";
import { hasTelegram } from "@/lib/telegram";
import { sendDueReminders } from "@/lib/reminders";
import { sendDueJobAlerts } from "@/lib/jobAlerts";

// Ежедневная рассылка бота (Vercel Cron, vercel.json): сроки документов и новые вакансии
export const maxDuration = 300;

export async function GET(request) {
  // Vercel Cron присылает заголовок Authorization: Bearer <CRON_SECRET>
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!hasRedis() || !hasTelegram()) {
    return Response.json({ error: "not configured" }, { status: 503 });
  }

  // Напоминания первыми: они быстрые и важнее, а поиск вакансий может идти минутами
  const reminders = await sendDueReminders();
  const jobAlerts = await sendDueJobAlerts();
  return Response.json({ reminders, jobAlerts });
}
