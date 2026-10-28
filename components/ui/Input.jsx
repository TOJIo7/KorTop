export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`min-h-12 w-full rounded-lg border border-slate-300 bg-card px-3.5 text-base text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 ${className}`}
      {...props}
    />
  );
}
