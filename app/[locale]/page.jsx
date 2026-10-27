import { Suspense } from "react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { FileText, MapPin, Receipt, ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { regionName, regions } from "@/lib/regions";
import { getPatent } from "@/lib/patents";
import { formatRub } from "@/lib/format";
import JobFilters from "@/components/jobs/JobFilters";
import CategoryChips from "@/components/jobs/CategoryChips";
import JobListSkeleton from "@/components/jobs/JobListSkeleton";
import FreshJobs from "@/components/home/FreshJobs";
import TicketTeaser, { Teaser } from "@/components/home/TicketTeaser";
import Skeleton from "@/components/ui/Skeleton";

const EMPTY_FILTERS = { text: "", region: "", housing: false, salary: null };

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const moscowPatent = getPatent("77");

  return (
    <div className="flex flex-col gap-6">
      <section className="-mx-4 -mt-6 flex flex-col gap-3 bg-brand-700 px-4 pb-6 pt-6 text-white">
        <h1 className="text-3xl font-extrabold leading-tight">{t("title")}</h1>
        <p className="text-brand-100">{t("subtitle")}</p>
        <div className="text-slate-900">
          <JobFilters initial={EMPTY_FILTERS} />
        </div>
      </section>

      <PopularRegions />
      <CategoryChips />

      <section className="grid gap-3 sm:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
          <TicketTeaser />
        </Suspense>
        <Teaser href="/patent" Icon={Receipt} title={t("patentTitle")}>
          {moscowPatent ? t("patentFrom", { price: formatRub(moscowPatent.monthly, locale) }) : t("patentLink")}
        </Teaser>
        <Teaser href="/documents" Icon={FileText} title={t("documentsTitle")}>
          {t("documentsText")}
        </Teaser>
        <Teaser href="/scams" Icon={ShieldAlert} title={t("scamsTitle")}>
          {t("scamsText")}
        </Teaser>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-bold">{t("freshTitle")}</h2>
        <Suspense fallback={<JobListSkeleton count={2} />}>
          <FreshJobs />
        </Suspense>
      </section>
    </div>
  );
}

async function PopularRegions() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  return (
    <section>
      <h2 className="mb-2 font-semibold text-slate-700">{t("popularRegions")}</h2>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {regions
          .filter((r) => r.popular)
          .map((r) => (
            <li key={r.id} className="shrink-0">
              <Link
                href={{ pathname: "/jobs", query: { region: r.id } }}
                className="flex min-h-11 items-center gap-1 rounded-full border border-slate-300 bg-white px-4 hover:bg-slate-50"
              >
                <MapPin size={16} className="text-brand-700" aria-hidden="true" />
                {regionName(r, locale)}
              </Link>
            </li>
          ))}
      </ul>
    </section>
  );
}
