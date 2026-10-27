import { setRequestLocale } from "next-intl/server";
import ComingSoon from "@/components/layout/ComingSoon";

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon page="home" />;
}
