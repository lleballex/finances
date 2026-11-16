import type { Metadata } from "next";
import { Providers } from "./providers";
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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
