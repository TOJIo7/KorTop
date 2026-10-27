const tones = {
  brand: "bg-brand-100 text-brand-800",
  accent: "bg-accent-100 text-accent-800",
  gray: "bg-slate-100 text-slate-700",
};

export default function Badge({ tone = "gray", children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
