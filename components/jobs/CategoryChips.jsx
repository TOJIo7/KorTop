import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/categories";
import { toJobsQuery } from "@/lib/jobFilters";

// Быстрые категории: подставляют профессию, регион и «с жильём» сохраняются
export default function CategoryChips({ filters = {} }) {
  const t = useTranslations("jobs.categories");

  return (
    <div>
      <h2 className="mb-2 font-semibold text-slate-700">{t("title")}</h2>
      <ul className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(({ key, query, Icon }) => {
          const active = filters.text === query;
          const href = { pathname: "/jobs", query: toJobsQuery({ ...filters, text: query, page: 1 }) };
          return (
            <li key={key} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "true" : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-full border px-4 font-medium ${
                  active ? "border-brand-700 bg-brand-700 text-white" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
