// Кнопка с нижней «гранью»: при нажатии она проседает — ощущение настоящей кнопки
const variants = {
  primary:
    "bg-brand-700 text-white shadow-[0_3px_0_var(--color-brand-900)] hover:bg-brand-600 active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-brand-900)]",
  secondary:
    "border border-slate-300 bg-card text-slate-900 shadow-[0_2px_0_var(--color-slate-300)] hover:border-slate-400 active:translate-y-[1px] active:shadow-none",
  ghost: "text-brand-700 hover:bg-brand-50",
};

// Классы кнопки отдельно, чтобы так же оформлять ссылки (<Link className={buttonStyles()}>)
export function buttonStyles(variant = "primary", className = "") {
  return `inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 font-semibold transition-[background-color,transform,box-shadow] disabled:pointer-events-none disabled:opacity-60 ${variants[variant]} ${className}`;
}

export default function Button({ variant = "primary", className = "", ...props }) {
  return <button className={buttonStyles(variant, className)} {...props} />;
}
