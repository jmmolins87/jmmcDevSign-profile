"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryNavItems = [
  { href: "/es/", label: "Inicio" },
  { href: "/es/demos", label: "Demos" },
  { href: "/es/blog/editor", label: "Editor" },
  { href: "/es/admin/approval", label: "Admin" },
] as const;

function normalizePath(pathname: string) {
  return pathname === "/es/" ? "/es" : pathname.replace(/\/$/, "");
}

export function PrimaryNav() {
  const pathname = normalizePath(usePathname());

  return (
    <nav aria-label="Navegación principal" className="hidden items-center gap-space-lg lg:flex">
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
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
