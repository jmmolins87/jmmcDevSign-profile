"use client";

import Link from "next/link";

import { Badge, Card, CardContent, CardMeta, ErrorState } from "@/app/components/ui";
import { useMockSession, type UserRole } from "@/app/es/auth/mock-session";
import { InterfaceStateControls } from "@/app/es/auth/interface-state-controls";

type ProtectedSurfaceProps = {
  allowedRoles: readonly UserRole[];
  children: React.ReactNode;
};

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  editor: "Editor",
  lector: "Lector",
};

export function ProtectedSurface({ allowedRoles, children }: ProtectedSurfaceProps) {
  const session = useMockSession();

  if (!session) {
    return (
      <section aria-labelledby="protected-surface-title" className="grid gap-space-lg">
        <ErrorState
          action={<Link className="inline-flex min-h-11 items-center border border-primary bg-primary px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-primary-foreground hover:border-accent hover:bg-background hover:text-primary" href="/es/login">Ir al acceso</Link>}
          message="Necesitas una sesión mock para abrir esta superficie protegida."
          title="Sesión requerida"
        />
        <span className="sr-only" id="protected-surface-title">Superficie protegida</span>
      </section>
    );
  }

  if (!allowedRoles.includes(session.role)) {
    return (
      <section aria-labelledby="protected-surface-title" className="grid gap-space-lg">
        <ErrorState
          action={<Link className="inline-flex min-h-11 items-center border border-primary bg-primary px-space-md font-headline text-label-caps uppercase tracking-[0.08em] text-primary-foreground hover:border-accent hover:bg-background hover:text-primary" href="/es/">Volver al portfolio</Link>}
          message={`Tu perfil ${roleLabels[session.role]} no tiene permisos para esta superficie.`}
          title="Acceso no autorizado"
        />
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-space-md">
            <div>
              <CardMeta>Sesión actual</CardMeta>
              <p className="mt-space-xs text-body-md text-on-surface-variant">{session.email}</p>
            </div>
            <Badge>{session.role}</Badge>
          </CardContent>
        </Card>
        <span className="sr-only" id="protected-surface-title">Acceso no autorizado</span>
      </section>
    );
  }

  return (
    <div className="grid gap-space-lg">
      <InterfaceStateControls />
      {children}
    </div>
  );
}
