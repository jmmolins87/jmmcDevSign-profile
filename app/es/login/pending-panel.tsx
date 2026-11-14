"use client";

import { useState, type FormEvent } from "react";

import { Badge, Button, CardMeta, ErrorState, InputField, StatusIndicator } from "@/app/components/ui";
import { registrationRequestsRepository, verificationChallengesRepository } from "@/app/es/auth/mock-auth-repository";
import { mockVerificationAdapter, type RegistrationVerificationAdapter } from "@/app/es/auth/mock-verification-service";
import type { RegistrationRequest } from "@/app/es/auth/types";
import { useMockRepository } from "@/app/es/repositories/use-mock-repository";

type PendingPanelProps = Readonly<{
  onVerified?: () => void;
  request: RegistrationRequest | null;
  verificationAdapter?: RegistrationVerificationAdapter;
}>;

export function PendingPanel({ onVerified, request, verificationAdapter = mockVerificationAdapter }: PendingPanelProps) {
  const storedRequests = useMockRepository(registrationRequestsRepository);
  const challenges = useMockRepository(verificationChallengesRepository);
  const currentRequest = request
    ? storedRequests.find((candidate) => candidate.id === request.id) ?? request
    : null;
  const challenge = currentRequest
    ? challenges.find((candidate) => candidate.registrationRequestId === currentRequest.id)
    : null;
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!currentRequest) {
      setError("La solicitud de registro no está disponible.");
      setIsSubmitting(false);
      return;
    }

    const result = await verificationAdapter.verifyRegistration(currentRequest.id, code);
    if (!result.ok) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    onVerified?.();
    setIsSubmitting(false);
  }

  const isApproved = currentRequest?.status === "approved";

  if (!currentRequest) {
    return (
      <div className="grid min-h-52 content-center gap-space-md" data-registration-state="pending">
        <StatusIndicator label="PENDIENTE DE APROBACIÓN" />
        <h3 className="font-headline text-headline-lg uppercase tracking-[0.02em] text-primary">Pendiente de aprobación</h3>
        <p className="border border-border bg-surface-container-lowest p-space-md text-body-md text-on-surface-variant">
          Este estado está disponible para inspección desde el selector de desarrollo.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-space-lg text-center" data-registration-state={isApproved ? "verification" : "pending"}>
      <div className="flex items-center justify-center gap-space-md font-mono text-5xl text-primary" aria-hidden="true">
        <span className="text-on-surface-variant">{"{"}</span>
        <span className="text-accent">✦</span>
        <span className="text-on-surface-variant">{"}"}</span>
      </div>
      <div className="grid justify-items-center gap-space-xs">
        <StatusIndicator label={isApproved ? "CÓDIGO EMITIDO" : "PENDIENTE DE APROBACIÓN"} />
        <h3 className="font-headline text-headline-lg uppercase tracking-[0.02em] text-primary">
          {isApproved ? "Verifica tu cuenta" : "Solicitud encolada"}
        </h3>
        <p className="max-w-xl text-body-md text-on-surface-variant">
          {isApproved
            ? "Introduce el código de seis dígitos enviado a tu bandeja mock para activar la cuenta."
            : "El administrador revisará tus credenciales y decidirá el rol antes de activar la cuenta."}
        </p>
      </div>
      <div className="grid gap-space-md border border-border bg-surface-container-lowest p-space-md text-start">
        <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-border pb-space-sm">
          <CardMeta>Registro / mock local</CardMeta>
          <Badge variant={isApproved ? "active" : "neutral"}>{isApproved ? "APPROVED" : "PENDING"}</Badge>
        </div>
        <dl className="grid gap-space-sm text-body-sm">
          <div className="flex flex-wrap justify-between gap-space-sm">
            <dt className="font-mono text-mono-code uppercase text-on-surface-variant">Solicitante</dt>
            <dd className="text-on-surface">{currentRequest.fullName}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-space-sm">
            <dt className="font-mono text-mono-code uppercase text-on-surface-variant">Correo</dt>
            <dd className="text-on-surface">{currentRequest.email}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-space-sm">
            <dt className="font-mono text-mono-code uppercase text-on-surface-variant">Rol asignado</dt>
            <dd className="text-on-surface">{currentRequest.assignedRole ?? currentRequest.requestedRole}</dd>
          </div>
        </dl>
        {challenge && isApproved ? (
          <p className="border-t border-border pt-space-sm text-body-sm text-on-surface-variant">
            Código válido hasta {new Date(challenge.expiresAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}.
          </p>
        ) : null}
      </div>
      {isApproved ? (
        <form className="grid gap-space-md text-start" noValidate onSubmit={handleVerify}>
          <InputField
            autoComplete="one-time-code"
            inputMode="numeric"
            label="Código de verificación"
            maxLength={6}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
              setError(null);
            }}
            pattern="[0-9]{6}"
            placeholder="000000"
            required
            value={code}
          />
          {error ? <ErrorState message={error} title="No se pudo activar la cuenta" /> : null}
          <Button disabled={isSubmitting} type="submit" variant="primary">
            {isSubmitting ? "Verificando…" : "Activar cuenta"}
          </Button>
        </form>
      ) : null}
      <p className="font-mono text-mono-code uppercase tracking-[0.08em] text-on-surface-variant">
        {isApproved ? "{ BANDEJA MOCK / CÓDIGO LISTO }" : "{ NOTIFICACIÓN MOCK ENVIADA AL ADMIN }"}
      </p>
    </div>
  );
}

