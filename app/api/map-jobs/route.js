import { groupJobsByPlace } from "@/lib/jobPlaces";
import { findRegion } from "@/lib/regions";
import { searchJobs } from "@/lib/trudvsem";

// Точки вакансий для карты Яндекса: ?region=77 → { places, total }. total — сколько всего вакансий в регионе
export async function GET(request) {
  const regionId = new URL(request.url).searchParams.get("region");
  if (!findRegion(regionId)) {
    return Response.json({ error: "region" }, { status: 400 });
  }

  try {
    const { jobs, total } = await searchJobs({ region: regionId, wide: true });
    return Response.json({ places: groupJobsByPlace(jobs), total });
  } catch {
    return Response.json({ error: "failed" }, { status: 502 });
  }
}
