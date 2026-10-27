import { useLocale, useTranslations } from "next-intl";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatDate, formatSalary, salaryInSomoni } from "@/lib/format";
import Badge from "@/components/ui/Badge";

// Карточка вакансии в списке (V-8). Работает и на сервере, и в избранном (клиент)
export default function JobCard({ job, action, rate = null }) {
  const t = useTranslations("jobs.card");
  const locale = useLocale();
  const somoni = salaryInSomoni(job, rate, locale);

  return (
    <article className="relative flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-2">
        <h2 className="flex-1 text-lg font-semibold leading-snug">
          {/* Ссылка растянута на всю карточку через after:absolute */}
          <Link href={`/jobs/${job.id}`} className="after:absolute after:inset-0 hover:text-brand-700">
            {job.title}
          </Link>
        </h2>
        {action && <div className="relative z-10">{action}</div>}
      </div>
      <p className="text-xl font-bold text-slate-900">
        {formatSalary(job, locale, t)}
        {somoni && <span className="ml-2 text-base font-medium text-slate-500">{somoni}</span>}
      </p>
      {job.employer && <p className="text-slate-700">{job.employer}</p>}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600">
        {job.region && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={16} aria-hidden="true" />
            {job.region}
          </span>
        )}
        {job.postedAt && (
          <span className="inline-flex items-center gap-1">
            <Calendar size={16} aria-hidden="true" />
            {formatDate(job.postedAt, locale)}
          </span>
        )}
      </div>
      {(job.housing || job.forForeigners) && (
        <div className="flex flex-wrap gap-2">
          {job.housing && <Badge tone="accent">{t("housing")}</Badge>}
          {job.forForeigners && <Badge tone="brand">{t("forForeigners")}</Badge>}
        </div>
      )}
    </article>
  );
}
