import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NavLinks from "./NavLinks";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="relative mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <Link href="/" className="mr-auto text-xl font-extrabold text-brand-700">
          {t("logo")}
        </Link>
        <nav className="hidden lg:block">
          <NavLinks />
        </nav>
        <LanguageSwitcher />
        <MobileMenu />
      </div>
    </header>
  );
}
