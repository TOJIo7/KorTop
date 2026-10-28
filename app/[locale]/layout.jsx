import { notFound } from "next/navigation";
import { Onest, Unbounded } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

// Onest — текст, Unbounded — заголовки. cyrillic-ext нужен для таджикских букв: ҷ ҳ ӣ ӯ қ ғ.
// display: optional — на медленном интернете остаёмся на системном шрифте,
// чтобы текст не перерисовывался после загрузки шрифта (быстрее первый экран)
const onest = Onest({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-onest",
  display: "optional",
});
// Для заголовков нужны только две насыщенности — так файлы шрифта в разы меньше переменной версии
const unbounded = Unbounded({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["600", "700"],
  variable: "--font-unbounded",
  display: "optional",
});

// Обе версии сайта (/tg и /ru) собираются заранее
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: "%s · KorTop" },
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${onest.variable} ${unbounded.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <NextIntlClientProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-6 sm:pt-10">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
