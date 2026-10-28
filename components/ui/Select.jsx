export default function Select({ className = "", children, ...props }) {
  return (
    <select
      className={`min-h-12 w-full rounded-lg border border-slate-300 bg-card px-3 text-base text-slate-900 outline-none transition-colors hover:border-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-100 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
