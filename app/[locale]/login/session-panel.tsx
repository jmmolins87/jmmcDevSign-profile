"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signOut } from "@/app/[locale]/auth/actions";
import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import { initialAuthFeedback } from "@/app/[locale]/auth/managed-types";
import { AuthFeedback } from "@/app/[locale]/login/auth-feedback";
import { Badge, Button, StatusIndicator } from "@/app/components/ui";
import { localePath } from "@/app/lib/i18n";
import { useLocale } from "@/app/lib/locale-context";
import type { EditorialAccess } from "@/app/lib/supabase/session";

export function SignOutForm() {
  const t = useManagedAuthCopy();
  const [feedback, action, pending] = useActionState(signOut, initialAuthFeedback);

  return (
    <form action={action} className="grid gap-space-md">
      <AuthFeedback feedback={feedback} />
      <Button disabled={pending} type="submit" variant="secondary">
        {t(pending ? "Cerrando sesión…" : "Cerrar sesión")}
      </Button>
    </form>
  );
}

export function SessionPanel({ access }: { access: Extract<EditorialAccess, { status: "active" }> }) {
  const t = useManagedAuthCopy();
  const locale = useLocale();
  const role = access.role === "admin" ? "Administrador" : access.role === "editor" ? "Editor" : "Revisor";

  return (
    <div className="grid gap-space-md" data-session-state="authenticated">
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <StatusIndicator label={t("SESIÓN ACTIVA")} status="active" />
        <Badge variant="active">{t(role)}</Badge>
      </div>
      <p className="wrap-anywhere font-headline text-headline-lg text-primary">{access.email}</p>
      <div className="grid gap-space-sm text-body-md">
        <Link className="text-primary underline" href={localePath("/es/blog/editor", locale)}>{t("Abrir el editor")}</Link>
        {access.role === "admin" ? (
          <Link className="text-primary underline" href={localePath("/es/admin/approval", locale)}>{t("Revisar solicitudes")}</Link>
        ) : null}
      </div>
      <SignOutForm />
    </div>
  );
}
