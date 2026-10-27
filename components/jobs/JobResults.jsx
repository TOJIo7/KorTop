import { getLocale, getTranslations } from "next-intl/server";
import { searchJobs } from "@/lib/trudvsem";
import { getRateOrNull } from "@/lib/safeRate";
import { formatDateTime, formatNumber, formatRub } from "@/lib/format";
import { hasActiveFilters } from "@/lib/jobFilters";
import ErrorState from "@/components/ui/ErrorState";
import JobCard from "./JobCard";
import FavoriteButton from "./FavoriteButton";
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
  const rate = (await getRateOrNull())?.rate ?? null;

  const { jobs, total, pageSize, fetchedAt } = result;
  const totalPages = Math.ceil(total / pageSize);

  if (total === 0) return <EmptyState canReset={hasActiveFilters(filters)} />;

  // Зарплату и «берут иностранцев» отбираем сами из страницы на 100 вакансий
  const filtering = Boolean(filters.salary || filters.foreign);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-slate-600">
        {t("found", { count: formatNumber(total, locale) })} · {t("dataAt", { date: formatDateTime(fetchedAt, locale) })}
      </p>
      {filtering && (
        <p className="rounded-xl bg-accent-100 p-3 text-accent-800">
          {t("filterNote", { shown: jobs.length, size: pageSize })}
          {filters.salary && ` ${t("salaryFilter", { value: formatRub(filters.salary, locale) })}`}
        </p>
      )}
      {jobs.length === 0 ? (
        filtering && totalPages > filters.page ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-600">{t("noneOnPage")}</p>
        ) : (
          <EmptyState canReset />
        )
      ) : (
        <ul className="flex flex-col gap-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} rate={rate} action={<FavoriteButton job={job} />} />
            </li>
          ))}
        </ul>
      )}
      <Pagination filters={filters} totalPages={totalPages} />
    </div>
  );
}
