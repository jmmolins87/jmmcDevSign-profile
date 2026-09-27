import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import GrainOverlay from "./components/GrainOverlay";
import ThemeProvider from "./components/ThemeProvider";
import { themeInitScript } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "JMMC — Diseño y desarrollo editorial",
  description:
    "Portafolio de JMMC: fullstack, diseño UI/UX, automatización e IA. Del primer boceto al deploy.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  /* SPEC 10 — Paso 5: el locale lo fija proxy.ts vía header `x-locale`. */
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
      /* SPEC 05: el script anti-parpadeo fija data-theme antes de la
         hidratación; React no lo renderiza y este flag evita el warning. */
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Material Symbols vía <link>: next/font/google no lo expone en esta versión (ver spec paso 1). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router, no pages/_document */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* SPEC 05 — anti-parpadeo: fija <html data-theme> antes del primer pintado. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-body-md">
        <ThemeProvider>
          <I18nProvider locale={locale} dict={dict}>
            <GrainOverlay />
            <Header />
            <main id="top" className="w-full pt-[72px] bg-background min-h-screen">
              {children}
            </main>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
