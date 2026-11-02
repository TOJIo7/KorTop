// Ответ API «Работа России» → наш формат вакансии (см. ROADMAP.md, «Наш формат вакансии»).
// Если поля нет — null, ничего не выдумываем. Примеры ответа: docs/samples/trudvsem-*.json

const ID_PREFIX = "trudvsem-";

// Наш id: trudvsem-<companycode>-<id вакансии>. companycode — только цифры (ОГРН),
// поэтому всё после первого «-» — это id вакансии (в нём самом есть дефисы)
export function makeJobId(companyCode, vacancyId) {
  return `${ID_PREFIX}${companyCode}-${vacancyId}`;
}

export function parseJobId(id) {
  const match = /^trudvsem-(\d+)-([\w-]+)$/.exec(id ?? "");
  return match ? { companyCode: match[1], vacancyId: match[2] } : null;
}

// Убираем HTML-теги и лишние пробелы; пустая строка → null
function cleanText(value) {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

// В term.text бывает служебная приставка вроде «MONTHLY 95 %,» или «ANNUAL 100 %»
function cleanTerms(value) {
  const text = cleanText(value);
  if (!text) return null;
  const withoutCodes = text.replace(/^(MONTHLY|ANNUAL|QUARTERLY)\b[\d\s%.,]*/i, "").trim();
  return withoutCodes || null;
}

function positiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Координата: на Чукотке долгота бывает отрицательной, а 0 и пустое значение означают, что её нет
function coordinate(value) {
  const n = Number(value);
  return Number.isFinite(n) && n !== 0 ? n : null;
}

// housing: true, если вакансия пришла по запросу с accommodation=true.
// В самой вакансии признака жилья нет, поэтому иначе null (неизвестно).
export function normalizeJob(vacancy, { housing = null } = {}) {
  if (!vacancy?.id || !vacancy?.company?.companycode) return null;

  const salaryFrom = positiveNumber(vacancy.salary_min);
  const salaryMax = positiveNumber(vacancy.salary_max);
  const contacts = (vacancy.contact_list ?? [])
    .filter((c) => c.contact_value && /телефон|почта/i.test(c.contact_type ?? ""))
    .map((c) => ({
      type: /телефон/i.test(c.contact_type) ? "phone" : "email",
      value: c.contact_value.trim(),
    }));

  return {
    id: makeJobId(vacancy.company.companycode, vacancy.id),
    source: "trudvsem",
    title: cleanText(vacancy["job-name"]),
    employer: cleanText(vacancy.company.name),
    region: cleanText(vacancy.region?.name),
    regionCode: vacancy.region?.region_code ?? null,
    address: cleanText(vacancy.addresses?.address?.[0]?.location),
    lat: coordinate(vacancy.addresses?.address?.[0]?.lat),
    lng: coordinate(vacancy.addresses?.address?.[0]?.lng),
    salaryFrom,
    salaryTo: salaryMax && salaryMax > (salaryFrom ?? 0) ? salaryMax : null,
    housing: housing === true ? true : null,
    forForeigners: vacancy.workPlaceType?.workPlaceForeign === true,
    employment: cleanText(vacancy.employment),
    schedule: cleanText(vacancy.schedule),
    duties: cleanText(vacancy.duty),
    requirements: cleanText(vacancy.requirements),
    education: cleanText(vacancy.requirement?.education),
    experienceYears: Number.isInteger(vacancy.requirement?.experience) ? vacancy.requirement.experience : null,
    terms: cleanTerms(vacancy.term?.text),
    contacts,
    url: vacancy.vac_url ?? null,
    postedAt: vacancy["creation-date"] ?? null,
  };
}
