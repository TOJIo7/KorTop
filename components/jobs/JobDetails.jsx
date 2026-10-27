import { useLocale, useTranslations } from "next-intl";
import { Building2, ExternalLink, MapPin, Phone, Mail } from "lucide-react";
import { formatDate, formatSalary } from "@/lib/format";
import { buttonStyles } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FavoriteButton from "./FavoriteButton";

// Все поля вакансии (V-9). Тексты — как прислал работодатель, на русском, с пометкой.
// saved — показываем сохранённую копию из избранного (вакансию сняли)
export default function JobDetails({ job, saved = false }) {
  const t = useTranslations("job");
  const tCard = useTranslations("jobs.card");
  const locale = useLocale();

  const facts = [
    [t("employment"), job.employment],
    [t("schedule"), job.schedule],
    [t("education"), job.education],
    [t("experience"), job.experienceYears === null ? null : job.experienceYears === 0 ? t("noExperience") : t("years", { count: job.experienceYears })],
    [t("postedAt"), formatDate(job.postedAt, locale)],
  ].filter(([, value]) => value);

  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold leading-tight">{job.title}</h1>
        <p className="text-2xl font-bold text-brand-800">{formatSalary(job, locale, tCard)}</p>
        {job.employer && (
          <p className="flex items-center gap-2 text-slate-700">
            <Building2 size={18} aria-hidden="true" /> {job.employer}
          </p>
        )}
        {(job.address || job.region) && (
          <p className="flex items-start gap-2 text-slate-700">
            <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> {job.address ?? job.region}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {job.housing && <Badge tone="accent">{tCard("housing")}</Badge>}
          {job.forForeigners && <Badge tone="brand">{tCard("forForeigners")}</Badge>}
        </div>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row">
        {job.url && (
          <a href={job.url} target="_blank" rel="noopener" className={buttonStyles("primary", "sm:flex-1")}>
            <ExternalLink size={18} aria-hidden="true" /> {t("openOriginal")}
          </a>
        )}
        <FavoriteButton job={job} withLabel />
      </div>

      {!saved && job.contacts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {job.contacts.map((c) => (
            <li key={c.value}>
              <a href={c.type === "phone" ? `tel:${c.value.replace(/[^\d+]/g, "")}` : `mailto:${c.value}`} className={buttonStyles("secondary", "w-full justify-start")}>
                {c.type === "phone" ? <Phone size={18} aria-hidden="true" /> : <Mail size={18} aria-hidden="true" />}
                {c.value}
              </a>
            </li>
          ))}
        </ul>
      )}

      {facts.length > 0 && (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-slate-500">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">{t("employerText")}</p>
      <TextBlock title={t("duties")} text={job.duties} />
      <TextBlock title={t("requirements")} text={job.requirements} />
      <TextBlock title={t("terms")} text={job.terms} />
    </article>
  );
}

function TextBlock({ title, text }) {
  if (!text) return null;
  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold">{title}</h2>
      <p lang="ru" className="whitespace-pre-line text-slate-800">{text}</p>
    </section>
  );
}
