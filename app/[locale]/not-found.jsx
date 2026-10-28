import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonStyles } from "@/components/ui/Button";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="flex flex-col items-start gap-3 py-10">
      <h1 className="text-[28px] leading-tight sm:text-4xl">{t("title")}</h1>
      <p className="text-slate-600">{t("text")}</p>
      <Link href="/" className={buttonStyles()}>
        {t("home")}
      </Link>
    </div>
  );
}
