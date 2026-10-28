"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

// Сердечко «В избранное»; withLabel — кнопка с текстом для страницы вакансии
export default function FavoriteButton({ job, withLabel = false }) {
  const t = useTranslations("favorites");
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(job.id);
  const label = active ? t("remove") : t("add");

  return (
    <button
      type="button"
      onClick={() => toggle(job)}
      aria-pressed={active}
      aria-label={withLabel ? undefined : label}
      className={`flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg transition-colors ${
        withLabel ? "min-h-12 border border-slate-300 bg-card px-5 font-semibold shadow-[0_2px_0_var(--color-slate-300)]" : ""
      } ${active ? "text-pom-600" : "text-slate-500 hover:text-pom-600"}`}
    >
      <Heart size={22} fill={active ? "currentColor" : "none"} aria-hidden="true" />
      {withLabel && label}
    </button>
  );
}
