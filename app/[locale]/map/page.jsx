import { Suspense } from "react";
import { connection } from "next/server";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { formatDate, formatRub } from "@/lib/format";
import { getPatent } from "@/lib/patents";
import { hasRedis } from "@/lib/redis";
import { getRegionCounts } from "@/lib/regionCounts";
import { regionName, sortedRegions } from "@/lib/regions";
import RegionExplorer from "@/components/map/RegionExplorer";
import Skeleton from "@/components/ui/Skeleton";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.map" });
  return { title: t("title") };
}

export default async function MapPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.map");
  const tMap = await getTranslations("map");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-tight sm:text-4xl">{t("title")}</h1>
        <p className="text-slate-700">{tMap("intro")}</p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <MapWithCounts />
      </Suspense>
    </div>
  );
}

// Числа читаем при открытии страницы: при сборке к внешним сервисам не обращаемся
async function MapWithCounts() {
  await connection();
  const locale = await getLocale();

  let counts = null;
  if (hasRedis()) {
    try {
      counts = await getRegionCounts();
    } catch {
      counts = null;
    }
  }

  const rows = sortedRegions(locale).map((region) => {
    const patent = getPatent(region.id);
    return {
      id: region.id,
      name: regionName(region, locale),
      count: counts?.[region.id]?.count ?? null,
      patent: patent ? formatRub(patent.monthly, locale) : null,
    };
  });
  const dates = Object.values(counts ?? {}).map((c) => c.at).sort();

  return <RegionExplorer regions={rows} dataDate={dates.length ? formatDate(dates.at(-1), locale) : null} />;
}
