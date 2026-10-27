import { cacheLife } from "next/cache";

// Курс ₽ → сомони. Основной источник — Нацбанк Таджикистана, запасной — ЦБ РФ.
// Примеры ответов: docs/samples/nbt-daily.xml и cbr-daily.xml
const NBT_URL = "https://nbt.tj/ru/kurs/export_xml.php";
const CBR_URL = "https://www.cbr.ru/scripts/XML_daily.asp";
const TIMEOUT_MS = 10_000;

// Достаём <Nominal> и <Value> валюты из XML; в ЦБ дробная часть через запятую
function parseValute(xml, charCode) {
  const block = new RegExp(`<CharCode>${charCode}</CharCode>[\\s\\S]*?</Valute>`).exec(xml)?.[0];
  if (!block) return null;
  const nominal = Number(/<Nominal>([\d.,]+)<\/Nominal>/.exec(block)?.[1]?.replace(",", "."));
  const value = Number(/<Value>([\d.,]+)<\/Value>/.exec(block)?.[1]?.replace(",", "."));
  return nominal > 0 && value > 0 ? { nominal, value } : null;
}

async function fetchText(url, encoding) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return new TextDecoder(encoding).decode(await res.arrayBuffer());
}

// Нацбанк: сколько сомони стоит 1 рубль (RUB, номинал 1). Заголовок XML врёт про windows-1251, тело в UTF-8
async function fromNbt(today) {
  const url = `${NBT_URL}?date=${today}&export=xmlout`;
  const rub = parseValute(await fetchText(url, "utf-8"), "RUB");
  if (!rub) throw new Error("NBT: нет RUB");
  return { rate: rub.value / rub.nominal, source: "nbt", sourceUrl: "https://nbt.tj/ru/kurs/kurs.php" };
}

// ЦБ РФ: сколько рублей стоят 10 сомони (TJS) → переворачиваем
async function fromCbr() {
  const tjs = parseValute(await fetchText(CBR_URL, "windows-1251"), "TJS");
  if (!tjs) throw new Error("CBR: нет TJS");
  return { rate: tjs.nominal / tjs.value, source: "cbr", sourceUrl: "https://www.cbr.ru/currency_base/daily/" };
}

/**
 * Курс на сегодня: { rate, source, sourceUrl, date }, где rate — сомони за 1 ₽.
 * Кэш на сутки (cacheLife "days"). Если оба источника не ответили — ошибка.
 */
export async function getRubToSomoni() {
  "use cache";
  cacheLife("days");

  // Сегодняшняя дата в Душанбе
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dushanbe" }).format(new Date());
  let result;
  try {
    result = await fromNbt(today);
  } catch {
    result = await fromCbr();
  }
  return { ...result, date: today };
}
