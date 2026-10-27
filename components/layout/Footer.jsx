import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Ссылку на репозиторий заменить после создания репозитория на GitHub
const GITHUB_URL = "https://github.com/";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-slate-600">
        <p className="font-semibold text-slate-800">{t("disclaimer")}</p>
        <div className="flex flex-wrap gap-x-4">
          <Link href="/sources" className="inline-flex min-h-11 items-center underline">
            {t("sources")}
          </Link>
          <a href={GITHUB_URL} className="inline-flex min-h-11 items-center underline" rel="noopener" target="_blank">
            {t("github")}
          </a>
        </div>
      </div>
    </footer>
  );
}
