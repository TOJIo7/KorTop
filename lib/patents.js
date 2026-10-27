import patentsData from "@/data/patents.json";

export const patentFormula = patentsData.formula;
export const patentYear = patentsData.year;

// Стоимость патента в регионе или null, если проверенных данных нет (P-2)
export function getPatent(regionId) {
  return patentsData.items.find((p) => p.regionId === regionId) ?? null;
}

export const patents = patentsData.items;
