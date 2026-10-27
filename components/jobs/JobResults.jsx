import { getLocale, getTranslations } from "next-intl/server";
import { searchJobs } from "@/lib/trudvsem";
import { formatDateTime, formatNumber, formatRub } from "@/lib/format";
import { hasActiveFilters } from "@/lib/jobFilters";
import ErrorState from "@/components/ui/ErrorState";
import JobCard from "./JobCard";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";

// Загружает вакансии с сервера и показывает список, «пусто» или ошибку (V-1, V-10)
export default async function JobResults({ filters }) {
  const t = await getTranslations("jobs");
  const locale = await getLocale();

  let result;
  try {
    result = await searchJobs(filters);
  } catch {
    return <ErrorState title={t("error.title")} hint={t("error.hint")} />;
  }

  const { jobs, total, pageSize, fetchedAt } = result;
  const totalPages = Math.ceil(total / pageSize);

  if (total === 0) return <EmptyState canReset={hasActiveFilters(filters)} />;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-slate-600">
        {t("found", { count: formatNumber(total, locale) })} · {t("dataAt", { date: formatDateTime(fetchedAt, locale) })}
      </p>
      {filters.salary && (
        <p className="rounded-xl bg-accent-100 p-3 text-accent-800">
          {t("salaryNote", { value: formatRub(filters.salary, locale) })}
        </p>
      )}
      {jobs.length === 0 ? (
        <EmptyState canReset />
      ) : (
        <ul className="flex flex-col gap-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} />
            </li>
          ))}
        </ul>
      )}
      <Pagination filters={filters} totalPages={totalPages} />
    </div>
  );
}
