import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink, PlaneTakeoff } from "lucide-react";
import { aviasalesSearchUrl, getCheapestPrices, hasTicketsToken } from "@/lib/travelpayouts";
import { formatDate, formatDateTime, formatRub } from "@/lib/format";
import { buttonStyles } from "@/components/ui/Button";

// Самые дешёвые даты с ценой «от … ₽» (T-2, T-3). Нет цен или токена — ссылка на Aviasales (T-4)
export default async function TicketResults({ from, to, month }) {
  const t = await getTranslations("tickets");
  const locale = await getLocale();
  const searchUrl = aviasalesSearchUrl(from, to);

  let result = null;
  if (hasTicketsToken()) {
    try {
      result = await getCheapestPrices({ origin: from, destination: to, month });
    } catch {
      result = null;
    }
  }

  if (!result || result.prices.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-6">
        <p className="text-slate-700">{t("noPrices")}</p>
        <a href={searchUrl} target="_blank" rel="noopener sponsored" className={buttonStyles()}>
          <ExternalLink size={18} aria-hidden="true" /> {t("openAviasales")}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600">{t("approx", { date: formatDateTime(result.fetchedAt, locale) })}</p>
      <ul className="flex flex-col gap-2">
        {result.prices.map((p) => (
          <li key={p.date} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <PlaneTakeoff size={22} className="shrink-0 text-brand-700" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-semibold">{formatDate(p.date, locale)}</p>
              {p.transfers !== null && (
                <p className="text-sm text-slate-600">{p.transfers === 0 ? t("direct") : t("transfers", { count: p.transfers })}</p>
              )}
            </div>
            <a href={p.url} target="_blank" rel="noopener sponsored" className="text-right">
              <span className="block text-lg font-bold text-accent-800">{t("priceFrom", { price: formatRub(p.price, locale) })}</span>
              <span className="text-sm text-brand-700 underline">{t("view")}</span>
            </a>
          </li>
        ))}
      </ul>
      <a href={searchUrl} target="_blank" rel="noopener sponsored" className={buttonStyles("secondary")}>
        <ExternalLink size={18} aria-hidden="true" /> {t("openAviasales")}
      </a>
    </div>
  );
}
