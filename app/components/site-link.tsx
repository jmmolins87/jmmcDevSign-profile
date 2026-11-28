"use client";

import NextLink, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { createPortal } from "react-dom";

import { LoadingState } from "@/app/components/ui/interface-state";
import { useCopy } from "@/app/lib/locale-context";

const labels = { es: "Cargando página…", en: "Loading page…" };

function PendingNavigation({ href }: { href: string }) {
  const { pending } = useLinkStatus();
  const label = useCopy(labels);
  if (!pending) return null;

  const destination = new URL(href, window.location.href);
  if (destination.hash && destination.pathname === window.location.pathname) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-background px-margin">
      <LoadingState label={label} variant="page" />
    </div>,
    document.body,
  );
}

export default function SiteLink({ children, href, ...props }: ComponentProps<typeof NextLink>) {
  return (
    <NextLink {...props} href={href}>
      {children}
      {typeof href === "string" && href.startsWith("/") && <PendingNavigation href={href} />}
    </NextLink>
  );
}
