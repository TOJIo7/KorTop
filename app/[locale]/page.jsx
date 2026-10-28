import { Suspense } from "react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { FileText, Receipt, Search, ShieldAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { regionName, regions } from "@/lib/regions";
import { getPatent } from "@/lib/patents";
import { formatRub } from "@/lib/format";
import JobFilters from "@/components/jobs/JobFilters";
import CategoryChips from "@/components/jobs/CategoryChips";
import JobListSkeleton from "@/components/jobs/JobListSkeleton";
import FreshJobs from "@/components/home/FreshJobs";
import TicketTeaser, { Teaser } from "@/components/home/TicketTeaser";
import { LogoMark } from "@/components/layout/Logo";
import SectionTitle from "@/components/ui/SectionTitle";
import Skeleton from "@/components/ui/Skeleton";

const EMPTY_FILTERS = { text: "", region: "", housing: false, foreign: false, salary: null };

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const moscowPatent = getPatent("77");

  return (
    <div className="flex flex-col gap-12">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="text-[34px] leading-[1.1] sm:text-5xl">{t.rich("title", { mark: (chunks) => <span className="marker">{chunks}</span> })}</h1>
          <p className="max-w-xl text-lg text-slate-600">{t("subtitle")}</p>
        </div>

        {/* Поиск в виде билета: корешок сверху, перфорация, форма */}
        <div>
          <div className="ticket" style={{ "--notch-y": "52px" }}>
            <div className="flex h-[52px] items-center justify-between bg-brand-700 px-5 text-white">
              <span className="flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider">
                <Search size={16} aria-hidden="true" />
                {t("searchLabel")}
              </span>
              <LogoMark size={22} />
            </div>
            <div className="mx-4 border-t-2 border-dashed border-line" aria-hidden="true" />
            <JobFilters initial={EMPTY_FILTERS} className="flex flex-col gap-3 p-5" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <PopularRegions />
        <CategoryChips />
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle>{t("usefulTitle")}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Suspense fallback={<Skeleton className="h-28 w-full" />}>
            <TicketTeaser />
          </Suspense>
          <Teaser href="/patent" Icon={Receipt} title={t("patentTitle")} tone="sun">
            {moscowPatent ? t("patentFrom", { price: formatRub(moscowPatent.monthly, locale) }) : t("patentLink")}
          </Teaser>
          <Teaser href="/documents" Icon={FileText} title={t("documentsTitle")} tone="plain">
            {t("documentsText")}
          </Teaser>
          <Teaser href="/scams" Icon={ShieldAlert} title={t("scamsTitle")} tone="pom">
            {t("scamsText")}
          </Teaser>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionTitle>{t("freshTitle")}</SectionTitle>
        <Suspense fallback={<JobListSkeleton count={3} />}>
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
    <div>
      <h2 className="mb-2 font-sans text-sm font-bold uppercase tracking-wider text-slate-500">{t("popularRegions")}</h2>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {regions
          .filter((r) => r.popular)
          .map((r) => (
            <li key={r.id} className="shrink-0">
              <Link
                href={{ pathname: "/jobs", query: { region: r.id } }}
                className="flex min-h-11 items-center rounded-full border border-slate-300 bg-card px-4 font-medium transition-colors hover:border-slate-900"
              >
                {regionName(r, locale)}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
