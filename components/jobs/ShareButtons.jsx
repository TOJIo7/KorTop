"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Send } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";

// Поделиться ссылкой на текущую страницу в Telegram или WhatsApp (G-5).
// Адрес берём в момент нажатия, поэтому сервер и браузер рисуют одинаковые кнопки
export default function ShareButtons({ title }) {
  const t = useTranslations("share");

  function share(service) {
    const url = window.location.href;
    const link =
      service === "telegram"
        ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        : `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
    window.open(link, "_blank", "noopener");
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium text-slate-700">{t("title")}</p>
      <div className="flex gap-2">
        <button type="button" onClick={() => share("telegram")} className={buttonStyles("secondary", "flex-1")}>
          <Send size={18} aria-hidden="true" /> Telegram
        </button>
        <button type="button" onClick={() => share("whatsapp")} className={buttonStyles("secondary", "flex-1")}>
          <MessageCircle size={18} aria-hidden="true" /> WhatsApp
        </button>
      </div>
    </div>
  );
}
