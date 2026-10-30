import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPatent, patentFormula, patentYear } from "@/lib/patents";
import { regionName, sortedRegions } from "@/lib/regions";
import { formatDate, formatRub } from "@/lib/format";
import PatentTable from "@/components/patent/PatentTable";
import CalculatorWithRate from "@/components/patent/CalculatorWithRate";
import Skeleton from "@/components/ui/Skeleton";
import ReminderForm from "@/components/reminders/ReminderForm";

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
    <div className="flex flex-col gap-8">
      <h1 className="text-[28px] leading-tight sm:text-4xl">{tPage("title")}</h1>

      {/* P-5: формула простыми словами */}
      <section className="flex flex-col gap-3 rounded-lg border border-accent-300 bg-accent-100 p-5">
        <h2 className="text-lg text-accent-800">{t("howTitle", { year: patentYear })}</h2>
        <p className="text-slate-800">
          {t("how", {
            base: formatRub(patentFormula.base, locale),
            deflator: new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(patentFormula.deflator),
          })}
        </p>
        <p className="self-start rounded-md bg-card px-3 py-2 money text-sm text-slate-900">{t("formula")}</p>
        <a href={patentFormula.deflatorSource} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center self-start text-sm text-accent-800 underline underline-offset-4">
          {t("formulaSource")}
        </a>
      </section>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CalculatorWithRate />
      </Suspense>

      <ReminderForm />

      <PatentTable rows={rows} />
    </div>
  );
}
