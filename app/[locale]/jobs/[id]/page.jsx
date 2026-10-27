import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import ComingSoon from "@/components/layout/ComingSoon";

// id вакансии заранее неизвестен, поэтому содержимое грузится внутри Suspense
export default function Page({ params }) {
  return (
    <Suspense>
      <Job params={params} />
    </Suspense>
  );
}

async function Job({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ComingSoon page="job" />;
}
