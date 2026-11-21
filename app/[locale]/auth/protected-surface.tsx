"use client";

import Link from "next/link";

import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import type { UserRole } from "@/app/[locale]/auth/roles";
import { RefreshAuthStatus } from "@/app/[locale]/login/pending-panel";
import { ErrorState } from "@/app/components/ui";
import { localePath } from "@/app/lib/i18n";
import { useLocale } from "@/app/lib/locale-context";
import type { EditorialAccess } from "@/app/lib/supabase/session";

const linkClass = "inline-flex min-h-11 items-center border border-primary bg-primary px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-primary-foreground hover:border-accent hover:bg-background hover:text-primary";

export function ProtectedSurface({ access, allowedRoles, children }: {
  access: EditorialAccess;
  allowedRoles: readonly UserRole[];
  children?: React.ReactNode;
}) {
  const t = useManagedAuthCopy();
  const locale = useLocale();

  if (access.status === "active" && allowedRoles.includes(access.role)) return children;

  if (access.status === "unavailable") {
    return (
      <ErrorState
        action={<RefreshAuthStatus />}
        message={t("El servicio de acceso no está disponible en este momento. Inténtalo de nuevo.")}
        title={t("Acceso temporalmente no disponible")}
      />
    );
  }

  const anonymous = access.status === "anonymous";
  const denied = access.status === "active";
  const href = localePath(denied ? "/es/" : "/es/login", locale);
  return (
    <ErrorState
      action={<Link className={linkClass} href={href}>{t(denied ? "Volver al portfolio" : "Ir al acceso")}</Link>}
      message={t(anonymous ? "Necesitas iniciar sesión para abrir esta superficie."
        : denied ? "Tu perfil no tiene permisos para esta superficie." : "Tu cuenta necesita una membresía activa para abrir esta superficie.")}
      title={t(anonymous ? "Sesión requerida" : "Acceso no autorizado")}
    />
  );
}
