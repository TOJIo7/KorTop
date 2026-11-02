"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Info, ScanSearch, ShieldAlert, TriangleAlert } from "lucide-react";
import { checkAd } from "@/lib/scamCheck";
import Button from "@/components/ui/Button";

const MAX_LENGTH = 3000;

// «Похоже на обман?»: подсвечивает опасные слова в объявлении. Всё считается здесь, в браузере.
// signs — { id: { title, example } } на нужном языке, готовит сервер из data/scams.json
export default function AdChecker({ signs }) {
  const t = useTranslations("scams.checker");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [empty, setEmpty] = useState(false);

  function check(value) {
    const trimmed = value.trim();
    setEmpty(!trimmed);
    setResult(trimmed ? checkAd(trimmed) : null);
  }

  function submit(e) {
    e.preventDefault();
    check(text);
  }

  function trySample() {
    const sample = t("sample");
    setText(sample);
    check(sample);
  }

  return (
    <section className="card flex flex-col gap-4 p-5">
      <div className="flex gap-3">
        <ScanSearch size={28} className="shrink-0 text-pom-600" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h2 className="text-xl">{t("title")}</h2>
          <p className="text-slate-700">{t("text")}</p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setResult(null);
          }}
          maxLength={MAX_LENGTH}
          rows={4}
          aria-label={t("label")}
          placeholder={t("placeholder")}
          className="w-full rounded-lg border border-slate-300 bg-card px-3.5 py-3 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
        />
        {empty && (
          <p role="alert" className="font-medium text-pom-700">
            {t("empty")}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit">
            <ScanSearch size={18} aria-hidden="true" /> {t("submit")}
          </Button>
          <Button type="button" variant="secondary" onClick={trySample}>
            {t("tryExample")}
          </Button>
        </div>
        <p className="text-sm text-slate-600">{t("privacy")}</p>
      </form>

      <div aria-live="polite">{result && <Result result={result} signs={signs} />}</div>
    </section>
  );
}

function Result({ result, signs }) {
  const t = useTranslations("scams.checker");
  const found = result.signs.length > 0;

  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <p className={`flex items-center gap-2 text-lg font-semibold ${found ? "text-pom-700" : "text-slate-900"}`}>
        {found ? <ShieldAlert size={24} className="shrink-0" aria-hidden="true" /> : <Info size={24} className="shrink-0" aria-hidden="true" />}
        {found ? t("found", { count: result.signs.length }) : t("notFound")}
      </p>

      {found && (
        <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-slate-800">
          {result.parts.map((part, index) =>
            part.signId ? (
              <mark key={index} className="rounded-sm bg-pom-50 px-0.5 font-semibold text-pom-700 underline decoration-pom-600 decoration-2 underline-offset-2">
                {part.text}
              </mark>
            ) : (
              <span key={index}>{part.text}</span>
            ),
          )}
        </p>
      )}

      {found && (
        <ul className="flex flex-col gap-3">
          {result.signs.map((id) => (
            <li key={id} className="flex gap-2">
              <TriangleAlert size={20} className="mt-0.5 shrink-0 text-pom-600" aria-hidden="true" />
              <div>
                <p className="font-semibold">{signs[id].title}</p>
                <p className="text-slate-600">{signs[id].example}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {result.unknownCompany && (
        <p className="flex gap-2 rounded-lg bg-accent-100 p-3 text-accent-800">
          <Info size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t("unknownCompany")}
        </p>
      )}

      {found && (
        <a href="#what-to-do" className="self-start font-semibold text-brand-700 underline underline-offset-4">
          {t("whatToDo")}
        </a>
      )}

      {/* Честно: ищем слова, а не проверяем компанию */}
      <p className="text-sm text-slate-600">{t("disclaimer")}</p>
    </div>
  );
}
