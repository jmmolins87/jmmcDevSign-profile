"use client";

import { useActionState, useState } from "react";

import { register, requestMembership } from "@/app/[locale]/auth/actions";
import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import { initialAuthFeedback } from "@/app/[locale]/auth/managed-types";
import { EDITORIAL_ROLES, isEditorialRole } from "@/app/[locale]/auth/roles";
import { AuthFeedback } from "@/app/[locale]/login/auth-feedback";
import type { AuthLocaleDraft } from "@/app/[locale]/login/auth-locale-handoff";
import { PasswordFields } from "@/app/[locale]/login/password-fields";
import { Button, CheckboxField, InputField } from "@/app/components/ui";
import { useLocale } from "@/app/lib/locale-context";

type SafeRegistrationDraft = Pick<AuthLocaleDraft, "email" | "fullName" | "requestedRole">;

export function RegistrationPanel({ completeRequest = false, initialDraft, onSafeDraftChange }: {
  completeRequest?: boolean;
  initialDraft?: SafeRegistrationDraft;
  onSafeDraftChange?: (draft: SafeRegistrationDraft) => void;
} = {}) {
  const t = useManagedAuthCopy();
  const locale = useLocale();
  const [draft, setDraft] = useState<SafeRegistrationDraft>(initialDraft ?? { email: "", fullName: "", requestedRole: "" });
  const submit = completeRequest ? requestMembership : register;
  const [feedback, action, pending] = useActionState(submit.bind(null, locale), initialAuthFeedback);

  function changeDraft(fields: Partial<SafeRegistrationDraft>) {
    const next = { ...draft, ...fields };
    setDraft(next);
    onSafeDraftChange?.(next);
  }

  if (feedback.status === "success") return <AuthFeedback feedback={feedback} />;

  return (
    <div className="grid gap-space-lg" data-registration-state="form">
      <div className="grid gap-space-xs">
        <h3 className="font-headline text-headline-lg uppercase tracking-[0.02em] text-primary">
          {t(completeRequest ? "Completa la solicitud" : "Solicitar acceso")}
        </h3>
        <p className="text-body-md text-on-surface-variant">
          {t("Completa tus datos para solicitar un rol editorial. El admin revisará la solicitud antes de activar la cuenta.")}
        </p>
      </div>
      <form action={action} className="grid gap-space-lg">
        <InputField
          autoComplete="name"
          label={t("Nombre completo")}
          maxLength={120}
          minLength={3}
          name="fullName"
          onChange={(event) => changeDraft({ fullName: event.target.value })}
          required
          value={draft.fullName}
        />
        {completeRequest ? null : (
          <>
            <InputField
              autoComplete="email"
              label={t("Correo electrónico")}
              maxLength={254}
              name="email"
              onChange={(event) => changeDraft({ email: event.target.value })}
              required
              type="email"
              value={draft.email}
            />
            <PasswordFields confirm />
          </>
        )}
        <fieldset className="grid gap-space-sm">
          <legend className="font-mono text-mono-code uppercase tracking-[0.12em] text-on-surface-variant">{t("Rol solicitado")}</legend>
          <div className="grid grid-cols-2 gap-space-sm">
            {EDITORIAL_ROLES.map((role) => (
              <label className="flex min-h-12 cursor-pointer items-center gap-space-sm border border-border p-space-sm text-body-md text-on-surface-variant has-checked:border-accent has-checked:text-primary" key={role}>
                <input
                  checked={draft.requestedRole === role}
                  name="requestedRole"
                  onChange={(event) => {
                    if (isEditorialRole(event.target.value)) changeDraft({ requestedRole: event.target.value });
                  }}
                  required
                  type="radio"
                  value={role}
                />
                {t(role === "editor" ? "Editor" : "Revisor")}
              </label>
            ))}
          </div>
        </fieldset>
        <CheckboxField
          label={t("Acepto los términos de acceso y el tratamiento de estos datos para revisar la solicitud.")}
          name="termsAccepted"
          required
        />
        <AuthFeedback feedback={feedback} />
        <Button disabled={pending} type="submit" variant="primary">
          {t(pending ? "Enviando solicitud…" : completeRequest ? "Solicitar acceso" : "Crear cuenta")}
        </Button>
      </form>
    </div>
  );
}
