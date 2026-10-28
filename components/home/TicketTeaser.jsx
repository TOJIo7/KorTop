import { connection } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Plane } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCheapestPrices, hasTicketsToken } from "@/lib/travelpayouts";
import { formatRub } from "@/lib/format";

// «Билет Душанбе → Москва от … ₽» за текущий месяц. Без токена или цен — просто ссылка.
// Оборачивать в <Suspense>
export default async function TicketTeaser() {
  const t = await getTranslations("home");
  const locale = await getLocale();

  let minPrice = null;
  if (hasTicketsToken()) {
    await connection(); // нужна сегодняшняя дата — считаем во время запроса
    const month = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dushanbe" }).format(new Date()).slice(0, 7);
    try {
      const { prices } = await getCheapestPrices({ origin: "DYU", destination: "MOW", month });
      if (prices.length) minPrice = Math.min(...prices.map((p) => p.price));
    } catch {
      minPrice = null;
    }
  }

  return (
    <Teaser href="/tickets" Icon={Plane} title={t("ticketTitle")} tone="dark">
      {minPrice ? t("ticketFrom", { price: formatRub(minPrice, locale) }) : t("ticketNoPrice")}
    </Teaser>
  );
}

// У каждого блока свой характер: тёмный «билет», шафрановый, бумажный, гранатовый
const tones = {
  dark: "bg-brand-900 text-white border-brand-900 [&_.teaser-title]:text-brand-100 [&_.teaser-icon]:text-accent-300",
  sun: "bg-accent-100 border-accent-300 [&_.teaser-title]:text-accent-800 [&_.teaser-icon]:text-accent-800",
  plain: "bg-card border-line [&_.teaser-title]:text-slate-600 [&_.teaser-icon]:text-brand-700",
  pom: "bg-pom-50 border-pom-600/30 [&_.teaser-title]:text-pom-700 [&_.teaser-icon]:text-pom-600",
};

export function Teaser({ href, Icon, title, children, tone = "plain" }) {
  return (
    <Link
      href={href}
      className={`group flex min-h-28 flex-col justify-between gap-4 rounded-lg border p-5 transition-transform hover:-translate-y-0.5 ${tones[tone]}`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="teaser-title text-sm font-bold uppercase tracking-wider">{title}</span>
        <Icon size={22} className="teaser-icon shrink-0" aria-hidden="true" />
      </span>
      <span className="flex items-end justify-between gap-2">
        <span className="money text-xl leading-tight">{children}</span>
        <ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}
