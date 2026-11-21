"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";

export function LanguageSelector({ alwaysVisible = false }: Readonly<{ alwaysVisible?: boolean }> = {}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthentication = /^\/(es|en)\/login\/?$/.test(pathname);
  return <div aria-label={locale === "es" ? "Selector de idioma" : "Language selector"} className={`${alwaysVisible ? "flex" : "hidden lg:flex"} items-center border border-border font-mono text-mono-code uppercase tracking-[0.12em]`} role="group">
    {(["es", "en"] as const).map((language) => {
      const props = {
        "aria-current": language === locale ? "true" as const : undefined,
        "aria-label": language === "es" ? "Español" : "English",
        className: `inline-flex min-h-10 min-w-10 items-center justify-center px-space-sm ${language === locale ? "bg-primary text-primary-foreground" : "text-on-surface-variant"}`,
        href: localePath(pathname, language),
        hrefLang: language,
        onClick: (event: MouseEvent<HTMLAnchorElement>) => {
          if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.button !== 0) return;
          if (language === locale) {
            event.preventDefault();
            return;
          }
          const destination = localePath(`${pathname}${window.location.search}${window.location.hash}`, language);
          if (isAuthentication) {
            event.preventDefault();
            // Clear credentials before the browser can retain this document in its history cache.
            flushSync(() => window.dispatchEvent(new Event("jmmc-locale-switch")));
            // Replace the auth entry so closing the translated modal cannot reopen the old one.
            window.location.replace(destination);
            return;
          }
          event.preventDefault();
          router.push(destination, { scroll: false });
        },
      };
      return isAuthentication
        ? <a {...props} key={language}>{language.toUpperCase()}</a>
        : <Link {...props} key={language} scroll={false}>{language.toUpperCase()}</Link>;
    })}
  </div>;
}
