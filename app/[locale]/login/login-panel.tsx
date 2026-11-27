"use client";

import { useActionState, useState } from "react";

import { sendRecoveryLink, signIn, updateRecoveredPassword } from "@/app/[locale]/auth/actions";
import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import { initialAuthFeedback } from "@/app/[locale]/auth/managed-types";
import { AuthFeedback } from "@/app/[locale]/login/auth-feedback";
import { PasswordFields } from "@/app/[locale]/login/password-fields";
import { SocialAuthOptions } from "@/app/[locale]/login/social-auth-options";
import { Button, InputField } from "@/app/components/ui";
import { useLocale } from "@/app/lib/locale-context";

export function LoginPanel({ initialEmail = "", onSafeDraftChange }: {
  initialEmail?: string;
  onSafeDraftChange?: (draft: { email: string }) => void;
} = {}) {
  const t = useManagedAuthCopy();
  const locale = useLocale();
  const [recovery, setRecovery] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [signInFeedback, submitLogin, signingIn] = useActionState(signIn, initialAuthFeedback);
  const [recoveryFeedback, submitRecovery, recovering] = useActionState(sendRecoveryLink.bind(null, locale), initialAuthFeedback);

  return (
    <div className="grid gap-space-md" data-session-state="anonymous">
      {!recovery && <SocialAuthOptions />}
      <form action={recovery ? submitRecovery : submitLogin} className="grid gap-space-md" key={recovery ? "recovery" : "login"}>
        {recovery ? <h3 className="font-headline text-headline-lg text-primary">{t("Recuperar contraseña")}</h3> : null}
        <InputField
          autoComplete="email"
          label={t("Correo electrónico")}
          maxLength={254}
          name="email"
          onChange={(event) => {
            setEmail(event.target.value);
            onSafeDraftChange?.({ email: event.target.value });
          }}
          required
          type="email"
          value={email}
        />
        {recovery ? null : <PasswordFields />}
        <AuthFeedback feedback={recovery ? recoveryFeedback : signInFeedback} />
        <Button disabled={signingIn || recovering} type="submit" variant="primary">
          {t(recovery ? (recovering ? "Enviando…" : "Enviar enlace") : (signingIn ? "Validando…" : "Iniciar sesión"))}
        </Button>
      </form>
      <Button disabled={signingIn || recovering} onClick={() => setRecovery((current) => !current)} type="button" variant="secondary">
        {t(recovery ? "Volver al acceso" : "¿Has olvidado tu contraseña?")}
      </Button>
    </div>
  );
}

export function ResetPasswordPanel() {
  const t = useManagedAuthCopy();
  const locale = useLocale();
  const [feedback, action, pending] = useActionState(updateRecoveredPassword.bind(null, locale), initialAuthFeedback);
  return (
    <form action={action} className="grid gap-space-md">
      <h3 className="font-headline text-headline-lg text-primary">{t("Elige una nueva contraseña")}</h3>
      <PasswordFields confirm />
      <AuthFeedback feedback={feedback} />
      <Button disabled={pending} type="submit" variant="primary">
        {t(pending ? "Guardando…" : "Guardar contraseña")}
      </Button>
    </form>
  );
}
