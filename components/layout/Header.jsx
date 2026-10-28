import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import NavLinks from "./NavLinks";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import FavoritesLink from "./FavoritesLink";
import Logo from "./Logo";

export default function Header() {
  const t = useTranslations("header");

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper">
      <div className="relative mx-auto flex max-w-5xl items-center gap-1 px-4 py-2">
        <Link href="/" className="mr-auto flex min-h-11 items-center" aria-label={t("logo")}>
          <Logo label={t("logo")} />
        </Link>
        <nav className="hidden lg:block">
          <NavLinks />
        </nav>
        <FavoritesLink />
        <LanguageSwitcher />
        <MobileMenu />
      </div>
    </header>
  );
}
