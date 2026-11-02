import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink, Phone } from "lucide-react";
import scams from "@/data/scams.json";
import AdChecker from "@/components/scams/AdChecker";
import SectionTitle from "@/components/ui/SectionTitle";

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
  const signs = Object.fromEntries(scams.signs.map((s) => [s.id, { title: pick(s.title), example: pick(s.example) }]));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-5">
        <h1 className="text-[28px] leading-tight sm:text-4xl">{tPage("title")}</h1>
        {/* Главное правило — крупной цитатой */}
        <blockquote className="border-l-[6px] border-pom-600 bg-pom-50 py-4 pl-5 pr-4 font-display text-xl font-semibold leading-snug text-pom-700 sm:text-2xl">
          {t("rule")}
        </blockquote>
      </div>

      <AdChecker signs={signs} />

      <section className="flex flex-col gap-4">
        <SectionTitle>{t("signsTitle")}</SectionTitle>
        <ol className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {scams.signs.map((sign, index) => (
            <li key={sign.id} className="flex gap-4 bg-card p-5">
              <span className="font-display text-2xl font-bold leading-none text-pom-600" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-sans text-lg font-semibold leading-snug">{pick(sign.title)}</h3>
                <p className="mt-1 text-slate-600">{pick(sign.example)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="what-to-do" className="flex scroll-mt-20 flex-col gap-4 rounded-lg bg-brand-900 p-5 text-white sm:p-7">
        <h2 className="text-xl text-white sm:text-2xl">{t("whatToDoTitle")}</h2>
        <ol className="flex flex-col gap-4">
          {scams.whatToDo.map((item, index) => (
            <li key={item.id} className="flex gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-500 font-display font-bold text-brand-900">
                {index + 1}
              </span>
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-brand-100">{pick(item.text)}</p>
                {item.phone && (
                  <a href={`tel:${item.phone}`} className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg bg-white px-5 font-display text-lg font-bold text-brand-900">
                    <Phone size={18} aria-hidden="true" /> {item.phone}
                  </a>
                )}
                {item.source && (
                  <a href={item.source} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-1 self-start text-accent-300 underline underline-offset-4">
                    <ExternalLink size={16} aria-hidden="true" /> {item.sourceTitle}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
