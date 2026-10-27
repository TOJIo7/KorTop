"use client";

import { useTranslations } from "next-intl";
import ErrorState from "@/components/ui/ErrorState";

// Запасной вариант на случай непредвиденной ошибки в разделе вакансий: шапка и меню остаются
export default function JobsError({ retry }) {
  const t = useTranslations("jobs.error");
  return <ErrorState title={t("title")} hint={t("hint")} retry={retry} />;
}
