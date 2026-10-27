import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/Button";

// «Ничего не найдено» с советом убрать фильтры (V-10)
export default function EmptyState({ canReset }) {
  const t = useTranslations("jobs.empty");

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <SearchX size={40} className="text-slate-400" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="text-slate-600">{t("hint")}</p>
      {canReset && (
        <Link href="/jobs" className={buttonStyles("secondary")}>
          {t("reset")}
        </Link>
      )}
    </div>
  );
}
