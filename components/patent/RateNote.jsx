import { getLocale, getTranslations } from "next-intl/server";
import { formatDate } from "@/lib/format";

// «1 ₽ = 0,1144 сомони · Нацбанк Таджикистана, 27 октября 2026» (R-1)
export default async function RateNote({ rate }) {
  const t = await getTranslations("rate");
  const locale = await getLocale();

  if (!rate) return <p className="text-sm text-slate-600">{t("unavailable")}</p>;

  const value = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 }).format(rate.rate);
  return (
    <p className="text-sm text-slate-600">
      {t("line", { value })} ·{" "}
      <a href={rate.sourceUrl} target="_blank" rel="noopener" className="underline">
        {t(`source.${rate.source}`)}
      </a>
      , {formatDate(rate.date, locale)}
    </p>
  );
}
