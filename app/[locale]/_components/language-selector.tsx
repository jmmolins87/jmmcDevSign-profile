"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";

export function LanguageSelector({ alwaysVisible = false }: Readonly<{ alwaysVisible?: boolean }> = {}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  return <div aria-label={locale === "es" ? "Selector de idioma" : "Language selector"} className={`${alwaysVisible ? "flex" : "hidden lg:flex"} items-center border border-border font-mono text-mono-code uppercase tracking-[0.12em]`} role="group">
    {(["es", "en"] as const).map((language) => <Link aria-current={language === locale ? "true" : undefined} aria-label={language === "es" ? "Español" : "English"} className={`inline-flex min-h-10 min-w-10 items-center justify-center px-space-sm ${language === locale ? "bg-primary text-primary-foreground" : "text-on-surface-variant"}`} href={localePath(pathname, language)} hrefLang={language} key={language} onClick={(event) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      window.dispatchEvent(new Event("jmmc-locale-switch"));
      router.push(localePath(`${pathname}${window.location.search}${window.location.hash}`, language), { scroll: false });
    }} scroll={false}>{language.toUpperCase()}</Link>)}
  </div>;
}
