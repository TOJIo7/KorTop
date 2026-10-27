import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPatent, patentFormula, patentYear } from "@/lib/patents";
import { regionName, sortedRegions } from "@/lib/regions";
import { formatDate, formatRub } from "@/lib/format";
import PatentTable from "@/components/patent/PatentTable";
import CalculatorWithRate from "@/components/patent/CalculatorWithRate";
import Skeleton from "@/components/ui/Skeleton";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.patent" });
  return { title: t("title") };
}

export default async function PatentPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("patent");
  const tPage = await getTranslations("pages.patent");

  // Строки таблицы форматируем здесь, на сервере: регионы с данными — первыми
  const rows = sortedRegions(locale)
    .map((region) => {
      const patent = getPatent(region.id);
      return {
        id: region.id,
        name: regionName(region, locale),
        nameRu: region.name.ru,
        price: patent ? formatRub(patent.monthly, locale) : null,
        law: patent?.law ?? null,
        source: patent?.source ?? null,
        checked: patent ? t("checkedAt", { date: formatDate(patent.checkedAt, locale) }) : null,
      };
    })
    .sort((a, b) => Number(Boolean(b.price)) - Number(Boolean(a.price)));

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">{tPage("title")}</h1>

      {/* P-5: формула простыми словами */}
      <section className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-4">
        <h2 className="font-semibold">{t("howTitle", { year: patentYear })}</h2>
        <p>
          {t("how", {
            base: formatRub(patentFormula.base, locale),
            deflator: new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(patentFormula.deflator),
          })}
        </p>
        <p className="font-mono text-sm">{t("formula")}</p>
        <a href={patentFormula.deflatorSource} target="_blank" rel="noopener" className="text-sm text-brand-700 underline">
          {t("formulaSource")}
        </a>
      </section>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CalculatorWithRate />
      </Suspense>

      <PatentTable rows={rows} />
    </div>
  );
}
