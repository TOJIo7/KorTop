const variants = {
  primary: "bg-brand-700 text-white hover:bg-brand-800",
  secondary: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  ghost: "text-brand-700 hover:bg-brand-50",
};

// Классы кнопки отдельно, чтобы так же оформлять ссылки (<Link className={buttonStyles()}>)
export function buttonStyles(variant = "primary", className = "") {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-semibold transition-colors disabled:opacity-50 ${variants[variant]} ${className}`;
}

export default function Button({ variant = "primary", className = "", ...props }) {
  return <button className={buttonStyles(variant, className)} {...props} />;
}
