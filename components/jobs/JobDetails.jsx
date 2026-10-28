import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { formatDate, formatSalary, salaryInSomoni } from "@/lib/format";
import { buttonStyles } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "./FavoriteButton";

// Все поля вакансии (V-9). Тексты — как прислал работодатель, на русском, с пометкой.
// saved — показываем сохранённую копию из избранного (вакансию сняли)
export default function JobDetails({ job, saved = false, rate = null }) {
  const t = useTranslations("job");
  const tCard = useTranslations("jobs.card");
  const locale = useLocale();
  const somoni = salaryInSomoni(job, rate, locale);

  const facts = [
    [t("employment"), job.employment],
    [t("schedule"), job.schedule],
    [t("education"), job.education],
    [t("experience"), job.experienceYears === null ? null : job.experienceYears === 0 ? t("noExperience") : t("years", { count: job.experienceYears })],
    [t("postedAt"), formatDate(job.postedAt, locale)],
  ].filter(([, value]) => value);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-[26px] leading-tight sm:text-4xl">{job.title}</h1>
        {job.employer && <p className="text-lg text-slate-700">{job.employer}</p>}
        {(job.address || job.region) && (
          <p className="flex items-start gap-2 text-slate-600">
            <MapPin size={18} className="mt-0.5 shrink-0 text-pom-600" aria-hidden="true" /> {job.address ?? job.region}
          </p>
        )}
      </header>

      {/* «Ценник»: зарплата крупно, метки-штампы */}
      <div className="flex flex-col gap-3 rounded-lg border-2 border-slate-900 bg-card p-5">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="money text-[24px] leading-tight sm:text-3xl">{formatSalary(job, locale, tCard)}</span>
          {somoni && <span className="text-lg text-slate-500">{somoni}</span>}
        </p>
        {(job.housing || job.forForeigners) && (
          <div className="flex flex-wrap gap-2">
            {job.housing && <Badge tone="accent">{tCard("housing")}</Badge>}
            {job.forForeigners && <Badge tone="brand">{tCard("forForeigners")}</Badge>}
          </div>
        )}
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          {job.url && (
            <a href={job.url} target="_blank" rel="noopener" className={buttonStyles("primary", "sm:flex-1")}>
              <ExternalLink size={18} aria-hidden="true" /> {t("openOriginal")}
            </a>
          )}
          <FavoriteButton job={job} withLabel />
        </div>
      </div>

      {!saved && job.contacts.length > 0 && (
        <ul className="card divide-y divide-line overflow-hidden">
          {job.contacts.map((c) => (
            <li key={c.value}>
              <a
                href={c.type === "phone" ? `tel:${c.value.replace(/[^\d+]/g, "")}` : `mailto:${c.value}`}
                className="flex min-h-14 items-center gap-3 px-4 font-medium transition-colors hover:bg-slate-50"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  {c.type === "phone" ? <Phone size={18} aria-hidden="true" /> : <Mail size={18} aria-hidden="true" />}
                </span>
                <span className="flex-1 truncate">{c.value}</span>
                <ChevronRight size={18} className="text-slate-400" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {facts.length > 0 && (
        <dl className="card grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
          {facts.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-4 py-3 sm:flex-col sm:justify-start sm:gap-0.5">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-right font-medium sm:text-left">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="border-l-4 border-accent-500 pl-4 text-slate-600">{t("employerText")}</p>
      <TextBlock title={t("duties")} text={job.duties} />
      <TextBlock title={t("requirements")} text={job.requirements} />
      <TextBlock title={t("terms")} text={job.terms} />
    </article>
  );
}

function TextBlock({ title, text }) {
  if (!text) return null;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-sans text-sm font-bold uppercase tracking-wider text-slate-500">{title}</h2>
      <p lang="ru" className="max-w-prose whitespace-pre-line text-[17px] leading-relaxed text-slate-800">{text}</p>
    </section>
  );
}
