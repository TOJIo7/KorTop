import { createTranslator } from "next-intl";
import ru from "@/messages/ru.json";
import tg from "@/messages/tg.json";
import { routing } from "@/i18n/routing";

const messages = { ru, tg };

// Тексты бота на языке человека (вне страницы, поэтому через createTranslator)
export function botTranslator(locale) {
  const l = routing.locales.includes(locale) ? locale : routing.defaultLocale;
  return { locale: l, t: createTranslator({ locale: l, messages: messages[l] }) };
}
