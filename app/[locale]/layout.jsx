import { notFound } from "next/navigation";
import { Inter } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

// cyrillic-ext нужен для таджикских букв: ҷ ҳ ӣ ӯ қ ғ
const inter = Inter({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-inter",
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
    <html lang={locale} className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <NextIntlClientProvider>
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
