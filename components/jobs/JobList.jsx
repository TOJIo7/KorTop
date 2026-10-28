// Обёртка списка вакансий: одна бумажная карточка, строки разделены линиями
export default function JobList({ children }) {
  return <ul className="card divide-y divide-line overflow-hidden">{children}</ul>;
}
