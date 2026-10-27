import regionsData from "@/data/regions.json";

export const regions = regionsData.regions;

export function findRegion(id) {
  return regions.find((r) => r.id === id) ?? null;
}

export function findRegionByTrudvsemCode(code) {
  return regions.find((r) => r.trudvsemCode === code) ?? null;
}

export function regionName(region, locale) {
  return region ? region.name[locale] ?? region.name.ru : null;
}

// Сначала популярные регионы, потом остальные по алфавиту на нужном языке
export function sortedRegions(locale) {
  const byName = (a, b) => regionName(a, locale).localeCompare(regionName(b, locale), locale);
  return [
    ...regions.filter((r) => r.popular),
    ...regions.filter((r) => !r.popular).sort(byName),
  ];
}
