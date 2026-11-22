"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localePath } from "@/app/lib/i18n";
import { useLocale } from "@/app/lib/locale-context";
import { usePublicCopy } from "@/app/lib/use-public-copy";

export function AdministrationNavLink({ mobile }: { mobile: boolean }) {
  const locale = useLocale();
  const t = usePublicCopy();
  const href = localePath("/es/admin/approval", locale);
  const current = usePathname().replace(/\/$/, "") === href;

  if (mobile) {
    return (
      <Link
        aria-current={current ? "page" : undefined}
        className="flex min-h-12 items-center justify-between border border-border px-space-md py-space-sm font-headline text-headline-md uppercase text-primary hover:border-accent"
        href={href}
      >
        {t("Aprobaciones")}
        <span aria-hidden="true" className="font-mono text-mono-code text-accent">→</span>
      </Link>
    );
  }

  return (
    <Link
      aria-current={current ? "page" : undefined}
      className={`border-b-2 py-space-sm font-headline text-label-caps uppercase tracking-[0.08em] transition-colors hover:text-primary ${
        current ? "border-accent text-primary" : "border-transparent text-on-surface-variant"
      }`}
      href={href}
    >
      {t("Administración")}
    </Link>
  );
}
