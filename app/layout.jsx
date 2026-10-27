import "./globals.css";

export const metadata = {
  title: "KorTop",
  description: "Работа в России для мигрантов из Таджикистана",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tg">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
