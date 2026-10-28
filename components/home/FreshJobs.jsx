import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { searchJobs } from "@/lib/trudvsem";
import JobCard from "@/components/jobs/JobCard";
import JobList from "@/components/jobs/JobList";

const COUNT = 6;

// Свежие вакансии на главной: берём первую страницу и сортируем по дате публикации.
// Оборачивать в <Suspense>
export default async function FreshJobs() {
  const t = await getTranslations("home");

  let jobs;
  try {
    const result = await searchJobs({ page: 1 });
    jobs = [...result.jobs].sort((a, b) => (b.postedAt ?? "").localeCompare(a.postedAt ?? "")).slice(0, COUNT);
  } catch {
    // API не ответил во время сборки — отложим этот блок до настоящего запроса
    await connection();
    return <p className="text-slate-600">{t("freshUnavailable")}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <JobList>
        {jobs.map((job) => (
          <li key={job.id}>
            <JobCard job={job} />
          </li>
        ))}
      </JobList>
      <Link href="/jobs" className="inline-flex min-h-11 items-center gap-1 self-start font-semibold text-brand-700">
        {t("allJobs")} <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </div>
  );
}
