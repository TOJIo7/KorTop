import { connection } from "next/server";
import { getLocale, getTranslations } from "next-intl/server";
import { Plane } from "lucide-react";
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
    <Teaser href="/tickets" Icon={Plane} title={t("ticketTitle")}>
      {minPrice ? t("ticketFrom", { price: formatRub(minPrice, locale) }) : t("ticketNoPrice")}
    </Teaser>
  );
}

export function Teaser({ href, Icon, title, children }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-brand-600">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <Icon size={24} aria-hidden="true" />
      </span>
      <span className="flex flex-col">
        <span className="text-slate-600">{title}</span>
        <span className="text-lg font-bold">{children}</span>
      </span>
    </Link>
  );
}
