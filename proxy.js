import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// В Next.js 16 middleware.js называется proxy.js
export default createMiddleware(routing);

export const config = {
  // Всё, кроме API, служебных файлов Next.js и файлов с расширением
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
