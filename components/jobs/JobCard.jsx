import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDate, formatSalary, salaryInSomoni } from "@/lib/format";
import Badge from "@/components/ui/Badge";

// Вакансия строкой списка (V-8). Списки оборачиваются в JobList (общая карточка с разделителями).
// Работает и на сервере, и в избранном (клиент)
export default function JobCard({ job, action, rate = null }) {
  const t = useTranslations("jobs.card");
  const locale = useLocale();
  const somoni = salaryInSomoni(job, rate, locale);
  const meta = [job.region, formatDate(job.postedAt, locale)].filter(Boolean).join(" · ");

  return (
    <article className="group relative flex gap-3 px-4 py-4 transition-colors hover:bg-slate-50 sm:px-5">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {meta && <p className="text-sm text-slate-500">{meta}</p>}
        <h3 className="font-sans text-lg font-semibold leading-snug">
          {/* Ссылка растянута на всю строку через after:absolute */}
          <Link href={`/jobs/${job.id}`} className="after:absolute after:inset-0 group-hover:text-brand-700">
            {job.title}
          </Link>
        </h3>
        {job.employer && <p className="truncate text-slate-600">{job.employer}</p>}
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="money text-lg text-slate-900">{formatSalary(job, locale, t)}</span>
          {somoni && <span className="text-slate-500">{somoni}</span>}
        </p>
        {(job.housing || job.forForeigners) && (
          <div className="mt-1.5 flex flex-wrap gap-2">
            {job.housing && <Badge tone="accent">{t("housing")}</Badge>}
            {job.forForeigners && <Badge tone="brand">{t("forForeigners")}</Badge>}
          </div>
        )}
      </div>
      {action && <div className="relative z-10 -mr-2 -mt-1 self-start">{action}</div>}
    </article>
  );
}
