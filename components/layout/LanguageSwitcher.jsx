"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels = { tg: "ТҶ", ru: "РУ" };
const localePrefix = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export default function LanguageSwitcher() {
  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();

  function switchTo(next) {
    // Адрес берём в момент нажатия: /tg/jobs?text=... → /jobs + фильтры
    const pathname = window.location.pathname.replace(localePrefix, "") || "/";
    const query = Object.fromEntries(new URLSearchParams(window.location.search));
    router.replace({ pathname, query }, { locale: next });
  }

  return (
    <div role="group" aria-label={t("language")} className="flex rounded-full border border-line bg-card">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={l === locale}
          className={`min-h-11 min-w-12 rounded-full px-2 text-sm font-bold tracking-wide transition-colors ${
            l === locale ? "bg-slate-900 text-paper" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
