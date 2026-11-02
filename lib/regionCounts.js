import { redis } from "./redis";
import { regions } from "./regions";
import { countRegionJobs } from "./trudvsem";

// Числа вакансий по регионам для карты. API отвечает по 10–15 секунд на регион, поэтому
// посетитель их не ждёт: раз в сутки /api/warm складывает числа в Redis, карта читает готовое.
// В Redis: map:counts — { "77": { count: 19325, at: "2026-10-30T..." }, ... }
const KEY = "map:counts";
const CONCURRENCY = 3; // как в /api/warm: больше API «Работа России» не выдерживает

export async function getRegionCounts() {
  const raw = await redis("GET", KEY);
  return raw ? JSON.parse(raw) : {};
}

// Обновляем до deadline, сначала самые старые числа: за пару запусков обновятся все регионы
export async function updateRegionCounts(deadline) {
  const counts = await getRegionCounts();
  const queue = [...regions].sort((a, b) => (counts[a.id]?.at ?? "").localeCompare(counts[b.id]?.at ?? ""));
  let updated = 0;
  let failed = 0;

  async function worker() {
    while (queue.length && Date.now() < deadline) {
      const region = queue.shift();
      try {
        counts[region.id] = { count: await countRegionJobs(region.id), at: new Date().toISOString() };
        updated++;
      } catch {
        failed++; // старое число остаётся до следующего запуска
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  await redis("SET", KEY, JSON.stringify(counts));
  return { updated, failed, left: queue.length };
}
