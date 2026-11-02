import { Briefcase, FileText, Heart, Map, Plane, Receipt, ShieldAlert } from "lucide-react";

// Пункты меню: адрес, ключ перевода header.menu.*, иконка
export const navItems = [
  { href: "/jobs", key: "jobs", Icon: Briefcase },
  { href: "/map", key: "map", Icon: Map },
  { href: "/tickets", key: "tickets", Icon: Plane },
  { href: "/patent", key: "patent", Icon: Receipt },
  { href: "/documents", key: "documents", Icon: FileText },
  { href: "/scams", key: "scams", Icon: ShieldAlert },
  { href: "/favorites", key: "favorites", Icon: Heart },
];
