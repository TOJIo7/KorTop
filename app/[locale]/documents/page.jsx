import { getTranslations, setRequestLocale } from "next-intl/server";
import { TriangleAlert } from "lucide-react";
import documents from "@/data/documents.json";
import { formatDate } from "@/lib/format";
import DocumentsChecklist from "@/components/documents/DocumentsChecklist";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.documents" });
  return { title: t("title") };
}

export default async function DocumentsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("documents");
  const tPage = await getTranslations("pages.documents");

  const pick = (value) => (value ? value[locale] ?? value.ru : null);
  const steps = documents.steps.map((s) => ({
    id: s.id,
    title: pick(s.title),
    text: pick(s.text),
    where: pick(s.where),
    deadline: pick(s.deadline),
    cost: pick(s.cost),
    source: s.source,
    sourceTitle: s.sourceTitle,
    // Шаги без подтверждённого официального источника помечаются «уточните»
    checked: s.verified && s.checkedAt ? t("checkedAt", { date: formatDate(s.checkedAt, locale) }) : null,
  }));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{tPage("title")}</h1>
      {/* D-3: правила меняются */}
      <div role="note" className="flex gap-3 rounded-2xl bg-accent-100 p-4 text-accent-800">
        <TriangleAlert size={24} className="shrink-0" aria-hidden="true" />
        <p>{t("banner", { date: formatDate(documents.checkedAt, locale) })}</p>
      </div>
      <p className="text-slate-700">{t("intro")}</p>
      <DocumentsChecklist steps={steps} />
    </div>
  );
}
