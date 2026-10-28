"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { navItems } from "./navItems";

// Ссылки меню с подсветкой текущего раздела; vertical — для мобильного меню.
// Адрес страницы известен только в браузере, поэтому подсветка внутри Suspense,
// а до этого показывается тот же список без подсветки.
export default function NavLinks(props) {
  return (
    <Suspense fallback={<NavList {...props} pathname="" />}>
      <ActiveNavList {...props} />
    </Suspense>
  );
}

function ActiveNavList(props) {
  const pathname = usePathname();
  return <NavList {...props} pathname={pathname} />;
}

function NavList({ vertical = false, onNavigate, pathname }) {
  const t = useTranslations("header.menu");

  return (
    <ul className={vertical ? "flex flex-col" : "flex items-center"}>
      {navItems.map(({ href, key, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <li key={key}>
            {vertical ? (
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 border-l-4 px-4 text-lg font-medium ${
                  active ? "border-pom-600 bg-pom-50 text-slate-900" : "border-transparent text-slate-800 hover:bg-slate-100"
                }`}
              >
                <Icon size={20} className="text-slate-500" aria-hidden="true" />
                {t(key)}
              </Link>
            ) : (
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-11 items-center px-3 font-medium transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-[3px] after:rounded-full after:transition-colors ${
                  active ? "text-slate-900 after:bg-accent-500" : "text-slate-600 hover:text-slate-900 after:bg-transparent"
                }`}
              >
                {t(key)}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
