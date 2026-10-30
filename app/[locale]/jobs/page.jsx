import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { parseJobFilters } from "@/lib/jobFilters";
import JobFilters from "@/components/jobs/JobFilters";
import CategoryChips from "@/components/jobs/CategoryChips";
import JobResults from "@/components/jobs/JobResults";
import JobListSkeleton from "@/components/jobs/JobListSkeleton";
import JobAlertButton from "@/components/jobs/JobAlertButton";
import Skeleton from "@/components/ui/Skeleton";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.jobs" });
  return { title: t("title") };
}

// Заголовок — в статической части страницы; фильтры и список зависят от адреса,
// поэтому грузятся внутри Suspense (пока ждём — скелетоны)
export default async function JobsPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.jobs");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] leading-tight sm:text-4xl">{t("title")}</h1>
      <Suspense fallback={<FiltersSkeleton />}>
        <FiltersAndResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FiltersAndResults({ searchParams }) {
  const filters = parseJobFilters(await searchParams);
  // key: при смене адреса список заново показывает скелетоны, пока грузится
  const key = JSON.stringify(filters);

  return (
    <>
      <JobFilters initial={filters} />
      <CategoryChips filters={filters} />
      <JobAlertButton filters={filters} />
      <Suspense key={key} fallback={<JobListSkeleton />}>
        <JobResults filters={filters} />
      </Suspense>
    </>
  );
}

function FiltersSkeleton() {
  return (
    <>
      <Skeleton className="h-56 w-full" />
      <JobListSkeleton />
    </>
  );
}
