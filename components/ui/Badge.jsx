// Метка в виде штампа: рамка, заглавные буквы
const tones = {
  brand: "border-brand-600 text-brand-700",
  accent: "border-accent-800 bg-accent-100 text-accent-800",
  pom: "border-pom-600 text-pom-700",
  gray: "border-slate-400 text-slate-600",
};

export default function Badge({ tone = "gray", children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-[4px] border-[1.5px] px-2 py-0.5 text-[13px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
