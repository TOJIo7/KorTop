import { searchJobs } from "@/lib/trudvsem";
import { regions } from "@/lib/regions";
import { categories } from "@/lib/categories";

// Прогрев кэша: Vercel Cron раз в сутки (vercel.json) заранее загружает популярные поиски,
// чтобы посетитель не ждал 15 секунд ответа «Работа России»
export const maxDuration = 300;

// Не больше 3 запросов одновременно: на 8 параллельных API перестаёт отвечать
const CONCURRENCY = 3;

function popularSearches() {
  const popular = regions.filter((r) => r.popular);
  return [
    {}, // вся Россия — главная и /jobs без фильтров
    ...popular.map((r) => ({ region: r.id })),
    ...["77", "50", "78"].map((region) => ({ region, housing: true })),
    ...categories.map((c) => ({ text: c.query })),
  ];
}

export async function GET(request) {
  // Vercel Cron присылает заголовок Authorization: Bearer <CRON_SECRET>
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const queue = popularSearches();
  let ok = 0;
  let failed = 0;
  async function worker() {
    while (queue.length) {
      const search = queue.shift();
      try {
        // Через searchJobs, как на странице: ключ кэша строится из аргументов,
        // поэтому они должны быть заполнены точно так же
        await searchJobs(search);
        ok++;
      } catch {
        failed++;
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  return Response.json({ ok, failed });
}
