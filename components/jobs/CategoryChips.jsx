import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories } from "@/lib/categories";
import { toJobsQuery } from "@/lib/jobFilters";
import ChipSlider from "@/components/ui/ChipSlider";

// Быстрые категории: подставляют профессию, регион и «с жильём» сохраняются
export default function CategoryChips({ filters = {} }) {
  const t = useTranslations("jobs.categories");

  return (
    <div>
      <h2 className="mb-2 font-sans text-sm font-bold uppercase tracking-wider text-slate-500">{t("title")}</h2>
      <ChipSlider>
        {categories.map(({ key, query, Icon }) => {
          const active = filters.text === query;
          const href = { pathname: "/jobs", query: toJobsQuery({ ...filters, text: query, page: 1 }) };
          return (
            <li key={key} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "true" : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-full border px-4 font-medium transition-colors ${
                  active ? "border-slate-900 bg-slate-900 text-paper" : "border-slate-300 bg-card text-slate-800 hover:border-slate-900"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ChipSlider>
    </div>
  );
}
