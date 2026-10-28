import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Ornament from "@/components/ui/Ornament";
import { LogoMark } from "./Logo";

export default function Footer() {
  const t = useTranslations("footer");
  const tHeader = useTranslations("header");

  return (
    <footer className="mt-auto bg-brand-900 text-brand-100">
      <Ornament className="bg-brand-900 py-3" />
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 pb-8 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex max-w-md flex-col gap-3">
          <span className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="font-display font-bold text-white">{tHeader("logo")}</span>
          </span>
          <p className="text-lg leading-snug text-white">{t("disclaimer")}</p>
        </div>
        <Link href="/sources" className="inline-flex min-h-11 items-center self-start text-accent-300 underline underline-offset-4 hover:text-white sm:self-auto">
          {t("sources")}
        </Link>
      </div>
    </footer>
  );
}
