export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100 ${className}`}
      {...props}
    />
  );
}
