import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toJobsQuery } from "@/lib/jobFilters";
import { buttonStyles } from "@/components/ui/Button";

// Страницы через offset API; фильтры сохраняются в ссылках
export default function Pagination({ filters, totalPages }) {
  const t = useTranslations("jobs");
  const { page } = filters;
  if (totalPages <= 1) return null;

  const href = (p) => ({ pathname: "/jobs", query: toJobsQuery({ ...filters, page: p }) });

  return (
    <nav className="flex items-center justify-between gap-2" aria-label={t("pagination")}>
      {page > 1 ? (
        <Link href={href(page - 1)} className={buttonStyles("secondary")}>
          <ChevronLeft size={18} aria-hidden="true" />
          {t("prev")}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-slate-600">{t("page", { page, pages: totalPages })}</span>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={buttonStyles("primary")}>
          {t("next")}
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
