// Форматирование денег и дат на нужном языке (tg / ru) без сторонних библиотек

export function formatNumber(value, locale) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

export function formatRub(value, locale) {
  return `${formatNumber(value, locale)} ₽`;
}

export function formatSomoni(value, locale) {
  return `${formatNumber(value, locale)} c.`;
}

// t — функция переводов с ключами salaryFrom / salaryTo / salaryRange / salaryUnknown
export function formatSalary({ salaryFrom, salaryTo }, locale, t) {
  if (salaryFrom && salaryTo) {
    return t("salaryRange", { from: formatNumber(salaryFrom, locale), to: formatNumber(salaryTo, locale) });
  }
  if (salaryFrom) return t("salaryFrom", { value: formatNumber(salaryFrom, locale) });
  if (salaryTo) return t("salaryTo", { value: formatNumber(salaryTo, locale) });
  return t("salaryUnknown");
}

// «≈ 8 010 c.» по нижней границе зарплаты; null, если нет зарплаты или курса (V-13)
export function salaryInSomoni({ salaryFrom, salaryTo }, rate, locale) {
  const base = salaryFrom ?? salaryTo;
  return base && rate ? `≈ ${formatSomoni(base * rate, locale)}` : null;
}

// «2026-10-20» → «20 октября 2026». Дата без времени считается по UTC, чтобы не съехать на день
export function formatDate(value, locale) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

// Дата и время для «данные на …» (по Москве — так считают в России)
export function formatDateTime(value, locale) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}
