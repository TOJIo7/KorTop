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
      className={`flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl ${
        withLabel ? "border border-slate-300 bg-white px-4 font-semibold" : ""
      } ${active ? "text-red-600" : "text-slate-500 hover:text-red-600"}`}
    >
      <Heart size={22} fill={active ? "currentColor" : "none"} aria-hidden="true" />
      {withLabel && label}
    </button>
  );
}
