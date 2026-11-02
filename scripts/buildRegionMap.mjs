// Собирает контуры регионов для карты: public/region-map.json
// Исходник — Natural Earth, Admin 1 (общественное достояние): https://www.naturalearthdata.com/
// Скачать: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson
// Запуск: node scripts/buildRegionMap.mjs <путь к geojson>
// Крым и Севастополь не рисуем (спорная граница) — в списке на странице они есть
import fs from "node:fs";

const WIDTH = 1000;
const TOLERANCE = 0.55; // насколько можно сдвинуть границу при упрощении, в единицах карты
const MIN_ISLAND_AREA = 4; // острова меньше этой площади выбрасываем

// Код ISO в Natural Earth → наш id региона
const IDS = {
  AD: "01", AL: "04", ALT: "22", AMU: "28", ARK: "29", AST: "30", BA: "02", BEL: "31", BRY: "32", BU: "03",
  CE: "20", CHE: "74", CHU: "87", CU: "21", DA: "05", IN: "06", IRK: "38", IVA: "37", KAM: "41", KB: "07",
  KC: "09", KDA: "23", KEM: "42", KGD: "39", KGN: "45", KHA: "27", KHM: "86", KIR: "43", KK: "19", KL: "08",
  KLU: "40", KO: "11", KOS: "44", KR: "10", KRS: "46", KYA: "24", LEN: "47", LIP: "48", MAG: "49", ME: "12",
  MO: "13", MOS: "77", MOW: "50", MUR: "51", NEN: "83", NGR: "53", NIZ: "52", NVS: "54", OMS: "55", ORE: "56",
  ORL: "57", PER: "59", PNZ: "58", PRI: "25", PSK: "60", ROS: "61", RYA: "62", SA: "14", SAK: "65", SAM: "63",
  SAR: "64", SE: "15", SMO: "67", SPE: "78", STA: "26", SVE: "66", TA: "16", TAM: "68", TOM: "70", TUL: "71",
  TVE: "69", TY: "17", TYU: "72", UD: "18", ULY: "73", VGG: "34", VLA: "33", VLG: "35", VOR: "36", YAN: "89",
  YAR: "76", YEV: "79", ZAB: "75",
};

// Коническая проекция Альберса: Россия выглядит привычно, Чукотка не разрывается на 180°
const rad = Math.PI / 180;
const [lat1, lat2, lat0, lon0] = [52 * rad, 64 * rad, 56 * rad, 100];
const n = (Math.sin(lat1) + Math.sin(lat2)) / 2;
const c = Math.cos(lat1) ** 2 + 2 * n * Math.sin(lat1);
const rho = (lat) => Math.sqrt(c - 2 * n * Math.sin(lat)) / n;
function project([lon, lat]) {
  const shifted = lon < 0 ? lon + 360 : lon; // восточнее 180° долгота отрицательная
  const theta = n * (shifted - lon0) * rad;
  return [rho(lat * rad) * Math.sin(theta), rho(lat * rad) * Math.cos(theta) - rho(lat0)];
}

// Каждый регион — список колец: [[x, y], ...]. Дырки (внутренние кольца) не нужны: внутри лежат другие регионы
const source = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const regions = source.features
  .filter((f) => f.properties.adm0_a3 === "RUS" && IDS[f.properties.iso_3166_2?.replace("RU-", "")])
  .map((f) => {
    const polygons = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
    return { id: IDS[f.properties.iso_3166_2.replace("RU-", "")], rings: polygons.map((poly) => poly[0].map(project)) };
  });

// Подгоняем под ширину 1000
const points = regions.flatMap((r) => r.rings.flat());
// Точек сотни тысяч: Math.min(...points) переполнил бы стек, поэтому считаем через reduce
const extent = (i, pick) => points.reduce((best, p) => pick(best, p[i]), points[0][i]);
const minX = extent(0, Math.min);
const minY = extent(1, Math.min);
const scale = WIDTH / (extent(0, Math.max) - minX);
const height = Math.ceil((extent(1, Math.max) - minY) * scale);
const keyOf = (p) => `${p[0]},${p[1]}`;
for (const r of regions) r.rings = r.rings.map((ring) => ring.map(([x, y]) => [(x - minX) * scale, (y - minY) * scale]));

function area(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return Math.abs(sum) / 2;
}
for (const r of regions) {
  const largest = Math.max(...r.rings.map(area));
  r.rings = r.rings.filter((ring) => area(ring) === largest || area(ring) >= MIN_ISLAND_AREA);
}

// Узлы — точки, где сходятся три региона и больше или кончается общая граница. Их не двигаем,
// а участки между ними упрощаем одинаково для обоих соседей, поэтому щелей между регионами нет
const owners = new Map();
for (const r of regions) {
  for (const ring of r.rings) {
    for (const p of ring) {
      const key = keyOf(p);
      if (!owners.has(key)) owners.set(key, new Set());
      owners.get(key).add(r.id);
    }
  }
}
const sameOwners = (a, b) => {
  const [x, y] = [owners.get(keyOf(a)), owners.get(keyOf(b))];
  return x.size === y.size && [...x].every((id) => y.has(id));
};

function douglasPeucker(line) {
  if (line.length < 3) return line;
  const [a, b] = [line[0], line.at(-1)];
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const length = Math.hypot(dx, dy);
  let farthest = 0;
  let distance = -1;
  for (let i = 1; i < line.length - 1; i++) {
    const [px, py] = [line[i][0] - a[0], line[i][1] - a[1]];
    const d = length === 0 ? Math.hypot(px, py) : Math.abs(px * dy - py * dx) / length;
    if (d > distance) [farthest, distance] = [i, d];
  }
  if (distance <= TOLERANCE) return [a, b];
  return [...douglasPeucker(line.slice(0, farthest + 1)).slice(0, -1), ...douglasPeucker(line.slice(farthest))];
}

// Один и тот же участок у соседей идёт в разные стороны: кэш по его концам и длине
const arcs = new Map();
function simplifyArc(line) {
  const forward = line.map(keyOf).join(";");
  const backward = [...line].reverse().map(keyOf).join(";");
  if (arcs.has(forward)) return arcs.get(forward);
  if (arcs.has(backward)) return [...arcs.get(backward)].reverse();
  const result = douglasPeucker(line);
  arcs.set(forward, result);
  return result;
}

function simplifyRing(ring) {
  const open = ring.slice(0, -1);
  // Кольцо режем на участки в точках, где меняется набор соседей
  const cuts = [];
  for (let i = 0; i < open.length; i++) {
    const prev = open[(i - 1 + open.length) % open.length];
    if (!sameOwners(prev, open[i])) cuts.push(i);
  }
  if (cuts.length === 0) {
    // Остров или граница только с одним соседом: режем в крайней точке, одинаковой для обоих соседей
    const start = open.reduce((best, p, i) => (keyOf(p) < keyOf(open[best]) ? i : best), 0);
    const opposite = (start + Math.floor(open.length / 2)) % open.length;
    cuts.push(...[start, opposite].sort((a, b) => a - b));
  }
  const result = [];
  for (let i = 0; i < cuts.length; i++) {
    const from = cuts[i];
    const to = cuts[(i + 1) % cuts.length];
    const line = [];
    for (let j = from; ; j = (j + 1) % open.length) {
      line.push(open[j]);
      if (j === to && line.length > 1) break;
    }
    result.push(...simplifyArc(line).slice(0, -1));
  }
  return result;
}

const round = (v) => Math.round(v * 10) / 10;
const toPath = (ring) => `M${ring.map((p) => `${round(p[0])} ${round(p[1])}`).join("L")}Z`;
const output = regions.map((r) => ({
  id: r.id,
  d: r.rings.map(simplifyRing).filter((ring) => ring.length >= 3).map(toPath).join(""),
}));

const map = { source: "Natural Earth, Admin 1 (public domain)", width: WIDTH, height, regions: output };
fs.writeFileSync("public/region-map.json", JSON.stringify(map));
console.log(`${output.length} регионов, ${WIDTH}×${height}, ${Math.round(fs.statSync("public/region-map.json").size / 1024)} КБ`);
