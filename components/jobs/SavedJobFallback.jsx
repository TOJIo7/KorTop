"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { buttonStyles } from "@/components/ui/Button";
import JobDetails from "./JobDetails";

// Вакансии больше нет в API: если она была в избранном — показываем сохранённую копию (V-11),
// иначе понятное сообщение и ссылку назад
export default function SavedJobFallback({ id }) {
  const t = useTranslations("job");
  const { favorites } = useFavorites();
  const saved = favorites.find((f) => f.job.id === id)?.job;

  return (
    <div className="flex flex-col gap-4">
      <div role="status" className="rounded-lg bg-accent-100 p-3 text-accent-800">
        {saved ? t("savedCopy") : t("notFound")}
      </div>
      {saved ? (
        <JobDetails job={saved} saved />
      ) : (
        <Link href="/jobs" className={buttonStyles("secondary", "self-start")}>
          {t("backToJobs")}
        </Link>
      )}
    </div>
  );
}
