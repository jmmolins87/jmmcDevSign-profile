import { notFound } from "next/navigation";
import { SiteShell } from "@/app/[locale]/_components/site-shell";
import { isLocale } from "@/app/lib/i18n";
import { LocaleProvider } from "@/app/lib/locale-context";

export function generateStaticParams() { return [{ locale: "es" }, { locale: "en" }]; }

// Wait for the locale before streaming so unsupported locales get an HTTP 404.
export const instant = false;

export default async function PublicLayout({
  children,
  params,
  modal,
}: Readonly<{ children: React.ReactNode; modal: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LocaleProvider locale={locale}><SiteShell>{children}{modal}</SiteShell></LocaleProvider>;
}
