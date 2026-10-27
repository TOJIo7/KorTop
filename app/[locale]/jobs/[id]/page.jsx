import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getJob } from "@/lib/trudvsem";
import { findRegionByTrudvsemCode } from "@/lib/regions";
import { getRateOrNull } from "@/lib/safeRate";
import JobDetails from "@/components/jobs/JobDetails";
import SavedJobFallback from "@/components/jobs/SavedJobFallback";
import ShareButtons from "@/components/jobs/ShareButtons";
import CalculatorWithRate from "@/components/patent/CalculatorWithRate";
import ErrorState from "@/components/ui/ErrorState";
import Skeleton from "@/components/ui/Skeleton";

// Заголовок вкладки = название вакансии, чтобы ссылка в Telegram выглядела понятно
export async function generateMetadata({ params }) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "pages.job" });
  try {
    const result = await getJob(id);
    return { title: result?.job.title ?? t("title") };
  } catch {
    return { title: t("title") };
  }
}

// id вакансии заранее неизвестен, поэтому содержимое грузится внутри Suspense
export default function JobPage({ params }) {
  return (
    <Suspense fallback={<JobSkeleton />}>
      <Job params={params} />
    </Suspense>
  );
}

async function Job({ params }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("job");

  return (
    <div className="flex flex-col gap-4">
      <Link href="/jobs" className="inline-flex min-h-11 items-center gap-2 self-start text-brand-700">
        <ArrowLeft size={18} aria-hidden="true" /> {t("backToJobs")}
      </Link>
      <JobContent id={id} />
      <p className="font-semibold text-slate-700">{t("disclaimer")}</p>
    </div>
  );
}

async function JobContent({ id }) {
  const t = await getTranslations("job");

  let result;
  try {
    result = await getJob(id);
  } catch {
    return <ErrorState title={t("error.title")} hint={t("error.hint")} />;
  }
  if (!result) return <SavedJobFallback id={id} />;

  const { job } = result;
  const rate = (await getRateOrNull())?.rate ?? null;
  return (
    <>
      <JobDetails job={job} rate={rate} />
      <ShareButtons title={job.title} />
      {/* P-4: калькулятор сразу заполнен зарплатой и регионом этой вакансии */}
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CalculatorWithRate
          initialSalary={job.salaryFrom ?? ""}
          initialRegion={findRegionByTrudvsemCode(job.regionCode)?.id ?? ""}
        />
      </Suspense>
    </>
  );
}

function JobSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
