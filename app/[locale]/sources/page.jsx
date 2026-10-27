import { getTranslations, setRequestLocale } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import documents from "@/data/documents.json";
import scams from "@/data/scams.json";
import regionsData from "@/data/regions.json";
import { patents, patentFormula } from "@/lib/patents";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.sources" });
  return { title: t("title") };
}

// Все API и сайты, откуда берутся данные (G-3). Ссылки собираются из data/, поэтому всегда актуальны
export default async function SourcesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sources");
  const tPage = await getTranslations("pages.sources");
  const date = (d) => (d ? formatDate(d, locale) : null);

  const groups = [
    {
      title: t("api"),
      items: [
        { title: t("trudvsem"), url: "https://trudvsem.ru/opendata/api", note: t("trudvsemNote") },
        { title: t("aviasales"), url: "https://support.travelpayouts.com/hc/en-us/articles/203956163", note: t("aviasalesNote") },
        { title: t("nbt"), url: "https://nbt.tj/ru/kurs/kurs.php", note: t("rateNote") },
        { title: t("cbr"), url: "https://www.cbr.ru/currency_base/daily/", note: t("cbrNote") },
      ],
    },
    {
      title: t("patents"),
      items: [
        { title: t("formula"), url: patentFormula.deflatorSource, checked: date(patentFormula.checkedAt) },
        ...patents.map((p) => ({ title: p.law, url: p.source, checked: date(p.checkedAt) })),
      ],
    },
    {
      title: t("documents"),
      // Один и тот же закон встречается в нескольких шагах — показываем каждую ссылку один раз
      items: [...new Map(documents.steps.map((s) => [s.source, s])).values()].map((s) => ({
        title: s.sourceTitle.split(",")[0],
        url: s.source,
        checked: s.verified ? date(s.checkedAt) : null,
      })),
    },
    {
      title: t("other"),
      items: [
        ...scams.whatToDo.filter((w) => w.source).map((w) => ({ title: w.sourceTitle, url: w.source, checked: date(scams.checkedAt) })),
        { title: t("regions"), url: "https://opendata.trudvsem.ru/api/v1/vacancies", checked: date(regionsData.checkedAt) },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">{tPage("title")}</h1>
      <p className="text-slate-700">{t("intro")}</p>
      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{group.title}</h2>
          <ul className="flex flex-col divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {group.items.map((item) => (
              <li key={item.url + item.title} className="flex flex-col gap-1 p-3">
                <a href={item.url} target="_blank" rel="noopener" className="inline-flex items-start gap-1 font-medium text-brand-700 underline">
                  <ExternalLink size={16} className="mt-1 shrink-0" aria-hidden="true" /> {item.title}
                </a>
                {item.note && <p className="text-sm text-slate-600">{item.note}</p>}
                {item.checked && <p className="text-sm text-slate-500">{t("checkedAt", { date: item.checked })}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
