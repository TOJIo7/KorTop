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
    <ul className={vertical ? "flex flex-col gap-1" : "flex items-center gap-1"}>
      {navItems.map(({ href, key, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <li key={key}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-3 font-medium ${
                active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              {t(key)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
