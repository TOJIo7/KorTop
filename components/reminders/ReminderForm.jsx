"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { BellRing, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const KINDS = ["patentPayment", "patentEnd", "registration"];

// Даты документов → ссылка на бота. Telegram откроется, человек нажмёт Start, бот запомнит даты
export default function ReminderForm() {
  const t = useTranslations("reminders");
  const locale = useLocale();
  const [dates, setDates] = useState({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!KINDS.some((kind) => dates[kind])) {
      setError("empty");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, dates }),
      });
      const body = await res.json();
      if (!res.ok || !body.url) throw new Error(body.error ?? "failed");
      window.location.href = body.url;
    } catch (err) {
      setError(["empty", "notConfigured"].includes(err.message) ? err.message : "failed");
      setPending(false);
    }
  }

  return (
    <section className="card flex flex-col gap-4 p-5">
      <div className="flex gap-3">
        <BellRing size={26} className="shrink-0 text-brand-700" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">{t("title")}</h2>
          <p className="text-slate-700">{t("text")}</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {KINDS.map((kind) => (
            <label key={kind} className="flex flex-col gap-1">
              <span className="font-medium text-slate-700">{t(`kinds.${kind}`)}</span>
              <Input type="date" value={dates[kind] ?? ""} onChange={(e) => setDates({ ...dates, [kind]: e.target.value })} />
            </label>
          ))}
        </div>
        {error && (
          <p role="alert" className="font-medium text-pom-700">
            {t(`errors.${error}`)}
          </p>
        )}
        <Button type="submit" disabled={pending} className="sm:self-start">
          <Send size={18} aria-hidden="true" />
          {pending ? t("sending") : t("submit")}
        </Button>
        <p className="text-sm text-slate-600">{t("hint")}</p>
      </form>

      <p className="border-t border-line pt-3 text-sm text-slate-500">{t("privacy")}</p>
    </section>
  );
}
