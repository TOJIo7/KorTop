"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { CircleAlert, RotateCw } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import Button from "./Button";

// Ошибка внешнего API с кнопкой «Повторить» (V-10). Остальная страница продолжает работать.
// retry передаёт error.jsx; без него просто перезапрашиваем данные страницы
export default function ErrorState({ title, hint, retry }) {
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRetry() {
    startTransition(() => (retry ? retry() : router.refresh()));
  }

  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <CircleAlert size={40} className="text-red-600" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="text-slate-700">{hint}</p>}
      <Button variant="secondary" onClick={handleRetry} disabled={pending}>
        <RotateCw size={18} className={pending ? "animate-spin" : ""} aria-hidden="true" />
        {t("retry")}
      </Button>
    </div>
  );
}
