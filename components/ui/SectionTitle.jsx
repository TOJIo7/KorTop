// Заголовок раздела с короткой гранатовой чертой слева
export default function SectionTitle({ children, as: Tag = "h2" }) {
  return (
    <Tag className="flex items-center gap-3 text-xl sm:text-2xl">
      <span className="h-6 w-1.5 shrink-0 rounded-full bg-pom-600" aria-hidden="true" />
      {children}
    </Tag>
  );
}
