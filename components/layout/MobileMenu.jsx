"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import NavLinks from "./NavLinks";

export default function MobileMenu() {
  const t = useTranslations("header");
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? t("closeMenu") : t("openMenu")}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-slate-800 hover:bg-slate-100"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-full border-b border-line bg-card py-2 shadow-[0_12px_24px_-12px_rgb(29_26_20/0.25)]">
          <NavLinks vertical onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </div>
  );
}
