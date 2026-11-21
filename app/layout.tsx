import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JMMC // Portfolio",
  description: "Portfolio y demos mock de JMMC Devsign.",
};

const themeScript = `(() => {
  try {
    const savedTheme = localStorage.getItem("jmmc-theme");
    const root = document.documentElement;
    const preference = savedTheme === "light" || savedTheme === "system" ? savedTheme : "dark";
    const theme = preference === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : preference;
    root.dataset.themePreference = preference;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  } catch {
    // The dark class in the server markup remains the safe default.
  }
})()`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
