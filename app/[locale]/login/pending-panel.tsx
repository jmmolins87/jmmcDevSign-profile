"use client";

import { useRouter } from "next/navigation";
import { useActionState, useTransition } from "react";

import { resendCode, verifyCode } from "@/app/[locale]/auth/actions";
import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import { initialAuthFeedback, type MembershipRequest } from "@/app/[locale]/auth/managed-types";
import { AuthFeedback } from "@/app/[locale]/login/auth-feedback";
import { Badge, Button, InputField } from "@/app/components/ui";

export function RefreshAuthStatus() {
  const t = useManagedAuthCopy();
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  return (
    <Button disabled={refreshing} onClick={() => startTransition(() => router.refresh())} type="button" variant="secondary">
      {t(refreshing ? "Consultando el estado…" : "Actualizar estado")}
    </Button>
  );
}

export function PendingPanel({ request, deliveryUnavailable = false }: {
  request: MembershipRequest;
  deliveryUnavailable?: boolean;
}) {
  const t = useManagedAuthCopy();
  const [activation, activate, activating] = useActionState(verifyCode, initialAuthFeedback);
  const [delivery, resend, resending] = useActionState(resendCode, initialAuthFeedback);

  const approved = request.status === "approved";
  const rejected = request.status === "rejected";
  const title = approved ? "Verifica tu cuenta" : rejected ? "Solicitud rechazada" : "Solicitud recibida";
  const description = approved
    ? "Introduce el código de seis dígitos enviado a tu correo."
    : rejected ? "Tu solicitud de acceso editorial fue rechazada." : "Tu solicitud está pendiente de revisión.";
  const deliveryLabel = request.delivery === "sent" ? "Código enviado"
    : request.delivery === "failed" ? "Entrega fallida" : request.delivery ? "Código en cola" : null;

  return (
    <section className="grid gap-space-lg" data-registration-state={approved ? "verification" : request.status}>
      <div className="grid gap-space-xs" aria-live="polite">
        <h3 className="font-headline text-headline-lg uppercase text-primary">{t(title)}</h3>
        <p className="text-body-md text-on-surface-variant">{t(description)}</p>
      </div>
      <div className="grid gap-space-sm border border-border p-space-md">
        <span className="text-body-sm text-on-surface-variant">{request.email}</span>
        <p className="font-headline text-body-md text-primary">
          {t(request.assignedRole ? "Rol asignado" : "Rol solicitado")}: {t((request.assignedRole ?? request.requestedRole) === "editor" ? "Editor" : "Revisor")}
        </p>
        {deliveryLabel ? (
          <Badge variant={request.delivery === "failed" ? "error" : request.delivery === "sent" ? "active" : "neutral"}>
            {t(deliveryLabel)}
          </Badge>
        ) : null}
      </div>
      {approved ? (
        <>
          {request.delivery === "failed" || deliveryUnavailable ? (
            <AuthFeedback feedback={{ status: "error", message: deliveryUnavailable
              ? "No se pudo consultar el estado de entrega." : "No se pudo entregar el código. Puedes solicitar otro." }} />
          ) : null}
          <form action={activate} className="grid gap-space-md">
            <InputField
              autoComplete="one-time-code"
              description={t("El código caduca diez minutos después de emitirse.")}
              inputMode="numeric"
              label={t("Código de verificación")}
              maxLength={6}
              name="code"
              pattern="[0-9]{6}"
              required
            />
            <AuthFeedback feedback={activation} />
            <Button disabled={activating || resending} type="submit" variant="primary">
              {t(activating ? "Verificando…" : "Activar cuenta")}
            </Button>
          </form>
          <form action={resend} className="grid gap-space-md">
            <Button disabled={activating || resending} type="submit" variant="secondary">
              {t(resending ? "Enviando…" : "Reenviar código")}
            </Button>
            <AuthFeedback feedback={delivery} />
          </form>
        </>
      ) : null}
      {!rejected ? <RefreshAuthStatus /> : null}
    </section>
  );
}
