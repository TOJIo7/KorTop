import { getTranslations, setRequestLocale } from "next-intl/server";
import FavoritesList from "@/components/jobs/FavoritesList";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.favorites" });
  return { title: t("title") };
}

export default async function FavoritesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.favorites");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[28px] leading-tight sm:text-4xl">{t("title")}</h1>
      <FavoritesList />
    </div>
  );
}
