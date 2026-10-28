"use client";

import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useFavorites } from "@/hooks/useFavorites";

// Сердечко со счётчиком избранного в шапке
export default function FavoritesLink() {
  const t = useTranslations("header.menu");
  const { favorites } = useFavorites();

  return (
    <Link
      href="/favorites"
      aria-label={`${t("favorites")}: ${favorites.length}`}
      className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
    >
      <Heart size={22} aria-hidden="true" />
      {favorites.length > 0 && (
        <span className="absolute right-0.5 top-0.5 min-w-5 rounded-full bg-pom-600 px-1 text-center text-xs font-bold leading-5 text-white">
          {favorites.length}
        </span>
      )}
    </Link>
  );
}
