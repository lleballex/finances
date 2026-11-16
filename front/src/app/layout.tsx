import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import "@/shared/ui/ui.css";

export const metadata: Metadata = {
  title: "Могну — Финансы",
  description: "Учёт и анализ личных финансов",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
