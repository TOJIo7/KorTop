import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, Phone, ShieldAlert } from "lucide-react";
import scams from "@/data/scams.json";
import { buttonStyles } from "@/components/ui/Button";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.scams" });
  return { title: t("title") };
}

// Признаки обмана (S-1) и что делать, если обманули (S-2)
export default async function ScamsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("scams");
  const tPage = await getTranslations("pages.scams");
  const pick = (value) => value[locale] ?? value.ru;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">{tPage("title")}</h1>
      <p className="rounded-2xl bg-red-50 p-4 font-semibold text-red-800">{t("rule")}</p>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t("signsTitle")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {scams.signs.map((sign) => (
            <li key={sign.id} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <ShieldAlert size={24} className="shrink-0 text-red-600" aria-hidden="true" />
              <div>
                <h3 className="font-semibold">{pick(sign.title)}</h3>
                <p className="mt-1 text-slate-700">{pick(sign.example)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t("whatToDoTitle")}</h2>
        <ol className="flex flex-col gap-3">
          {scams.whatToDo.map((item, index) => (
            <li key={item.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
              <p>
                {index + 1}. {pick(item.text)}
              </p>
              {item.phone && (
                <a href={`tel:${item.phone}`} className={buttonStyles("primary", "self-start")}>
                  <Phone size={18} aria-hidden="true" /> {item.phone}
                </a>
              )}
              {item.source && (
                <a href={item.source} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1 self-start text-brand-700 underline">
                  <ExternalLink size={16} aria-hidden="true" /> {item.sourceTitle}
                </a>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
