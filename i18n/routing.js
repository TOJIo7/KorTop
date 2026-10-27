import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tg", "ru"],
  defaultLocale: "tg",
  // Первый заход всегда на таджикском, не по языку браузера
  localeDetection: false,
  // Запоминаем выбранный язык на год
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});
