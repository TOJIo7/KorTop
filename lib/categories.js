import { Factory, HardHat, SprayCan, Tractor, Truck, UtensilsCrossed, Warehouse } from "lucide-react";

// Быстрые категории для рабочих профессий (V-6). query — слово для поиска в API «Работа России»;
// слова подобраны по числу найденных вакансий (проверено 27.10.2026)
export const categories = [
  { key: "construction", query: "строитель", Icon: HardHat },
  { key: "warehouse", query: "кладовщик", Icon: Warehouse },
  { key: "delivery", query: "курьер", Icon: Truck },
  { key: "food", query: "повар", Icon: UtensilsCrossed },
  { key: "cleaning", query: "уборщик", Icon: SprayCan },
  { key: "manufacturing", query: "оператор", Icon: Factory },
  { key: "agriculture", query: "тракторист", Icon: Tractor },
];
