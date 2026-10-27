import { getTranslations } from "next-intl/server";

// Временная страница-заглушка: заголовок раздела и «в разработке»
export default async function ComingSoon({ page }) {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{t(`pages.${page}.title`)}</h1>
      <p className="text-slate-600">{t("common.comingSoon")}</p>
    </div>
  );
}
