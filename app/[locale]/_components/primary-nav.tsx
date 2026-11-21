"use client";

import { useLocale } from "@/app/lib/locale-context";
import { localePath } from "@/app/lib/i18n";

import { usePublicCopy } from "@/app/lib/use-public-copy";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryNavItems = [
  { href: "/es/", label: "Inicio" },
  { href: "/es/demos", label: "Demos" },
  { href: "/es/blog/editor", label: "Editor" },
] as const;

function normalizePath(pathname: string) {
  return pathname === "/es/" ? "/es" : pathname.replace(/\/$/, "");
}

export function PrimaryNav({ adminLink }: { adminLink?: React.ReactNode } = {}) {
  const locale = useLocale();
  const t = usePublicCopy();
  const pathname = normalizePath(usePathname().replace(/^\/en(?=\/|$)/, "/es"));
  return (
    <nav aria-label={t("Navegación principal")} className="hidden items-center gap-space-lg lg:flex">
      {primaryNavItems.map((item) => {
        const normalizedHref = normalizePath(item.href);
        const isActive =
          pathname === normalizedHref ||
          (normalizedHref === "/es/demos" && pathname.startsWith("/es/demos/"));

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={`border-b-2 py-space-sm font-headline text-label-caps uppercase tracking-[0.08em] transition-colors hover:text-primary ${
              isActive
                ? "border-accent text-primary"
                : "border-transparent text-on-surface-variant"
            }`}
            href={localePath(item.href, locale)}
            key={item.href}
          >
            {t(item.label)}
          </Link>
        );
      })}
      {adminLink}
    </nav>
  );
}
