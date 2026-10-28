// Полоска орнамента по мотивам сюзане: ромб, точки и маленькие ромбы, повторяется по ширине.
// Чисто декоративная, поэтому aria-hidden
const tile = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="12" viewBox="0 0 32 12">
    <path d="M8 1 L13 6 L8 11 L3 6 Z" fill="#b3362b"/>
    <circle cx="8" cy="6" r="1.6" fill="#f2c46f"/>
    <path d="M24 3.5 L26.5 6 L24 8.5 L21.5 6 Z" fill="#283a85"/>
    <circle cx="16" cy="6" r="1" fill="#e49b2f"/>
    <circle cx="0" cy="6" r="1" fill="#e49b2f"/>
    <circle cx="32" cy="6" r="1" fill="#e49b2f"/>
  </svg>`
);

export default function Ornament({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`h-3 w-full ${className}`}
      style={{ backgroundImage: `url("data:image/svg+xml,${tile}")`, backgroundRepeat: "repeat-x", backgroundPosition: "center" }}
    />
  );
}
