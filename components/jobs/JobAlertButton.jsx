"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BellRing } from "lucide-react";
import { toJobsQuery } from "@/lib/jobFilters";
import Button from "@/components/ui/Button";

// «Новые вакансии в Telegram»: текущий поиск → ссылка на бота → человек жмёт Start
export default function JobAlertButton({ filters }) {
  const t = useTranslations("jobAlerts");
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function subscribe() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/job-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, query: toJobsQuery({ ...filters, page: 1 }) }),
      });
      const body = await res.json();
      if (!res.ok || !body.url) throw new Error(body.error ?? "failed");
      window.location.href = body.url;
    } catch (err) {
      setError(err.message === "notConfigured" ? "notConfigured" : "failed");
      setPending(false);
    }
  }

  return (
    <section className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 gap-3">
        <BellRing size={24} className="shrink-0 text-brand-700" aria-hidden="true" />
        <div className="flex flex-col">
          <h2 className="font-sans text-base font-semibold">{t("title")}</h2>
          <p className="text-sm text-slate-600">{t("text")}</p>
          {error && (
            <p role="alert" className="mt-1 text-sm font-medium text-pom-700">
              {t(`errors.${error}`)}
            </p>
          )}
        </div>
      </div>
      <Button type="button" onClick={subscribe} disabled={pending} className="shrink-0">
        {pending ? t("sending") : t("submit")}
      </Button>
    </section>
  );
}
