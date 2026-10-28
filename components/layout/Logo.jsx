// Знак: восьмиконечная звезда-розетка (два повёрнутых квадрата), как в узорах сюзане
export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="7" y="7" width="18" height="18" rx="2" fill="#b3362b" />
      <rect x="7" y="7" width="18" height="18" rx="2" fill="#b3362b" transform="rotate(45 16 16)" />
      <circle cx="16" cy="16" r="5.5" fill="#fffcf6" />
      <circle cx="16" cy="16" r="3" fill="#e49b2f" />
    </svg>
  );
}

export default function Logo({ label }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight text-slate-900">{label}</span>
    </span>
  );
}
