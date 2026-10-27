import { notFound } from "next/navigation";

// Любой несуществующий адрес внутри /tg или /ru показывает not-found.jsx на нужном языке
export default function CatchAll() {
  notFound();
}
