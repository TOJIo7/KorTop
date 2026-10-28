"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useFavorites } from "@/hooks/useFavorites";
import { buttonStyles } from "@/components/ui/Button";
import JobCard from "./JobCard";
import JobList from "./JobList";
import FavoriteButton from "./FavoriteButton";

// Список избранного из localStorage: копии вакансий, работают без интернета к API
export default function FavoritesList() {
  const t = useTranslations("favorites");
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-card p-8 text-center">
        <Heart size={40} className="text-slate-400" aria-hidden="true" />
        <p className="text-slate-600">{t("empty")}</p>
        <Link href="/jobs" className={buttonStyles()}>
          {t("findJobs")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-slate-600">{t("note")}</p>
      <JobList>
        {favorites.map(({ job }) => (
          <li key={job.id}>
            <JobCard job={job} action={<FavoriteButton job={job} />} />
          </li>
        ))}
      </JobList>
    </div>
  );
}
