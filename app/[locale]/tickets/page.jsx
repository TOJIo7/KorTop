import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { destinations, nextMonths, parseTicketParams } from "@/lib/ticketParams";
import TicketSearch from "@/components/tickets/TicketSearch";
import TicketResults from "@/components/tickets/TicketResults";
import Skeleton from "@/components/ui/Skeleton";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.tickets" });
  return { title: t("title") };
}

export default async function TicketsPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.tickets");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <SearchAndResults searchParams={searchParams} locale={locale} />
      </Suspense>
    </div>
  );
}

async function SearchAndResults({ searchParams, locale }) {
  const query = await searchParams;
  // Текущий месяц по Душанбе — после чтения адреса, то есть уже во время запроса
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dushanbe" }).format(new Date());
  const months = nextMonths(today);
  const selected = parseTicketParams(query, months);
  const key = JSON.stringify(selected);
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const monthOptions = months.map((m) => ({ value: m, label: monthFormat.format(new Date(`${m}-01`)) }));

  return (
    <>
      <TicketSearch key={key} initial={selected} destinations={destinations} months={monthOptions} />
      <Suspense key={key} fallback={<Skeleton className="h-64 w-full" />}>
        <TicketResults {...selected} />
      </Suspense>
    </>
  );
}
