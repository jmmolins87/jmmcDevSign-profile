"use client";

import { useActionState } from "react";

import { signInWithSocialProvider } from "@/app/[locale]/auth/actions";
import { initialAuthFeedback } from "@/app/[locale]/auth/managed-types";
import { socialProviders } from "@/app/[locale]/auth/social-providers";
import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import { AuthFeedback } from "@/app/[locale]/login/auth-feedback";
import { Button } from "@/app/components/ui";
import { useLocale } from "@/app/lib/locale-context";

export function SocialAuthOptions() {
  const t = useManagedAuthCopy();
  const locale = useLocale();
  const [feedback, action, pending] = useActionState(signInWithSocialProvider.bind(null, locale), initialAuthFeedback);

  return (
    <form action={action} className="grid gap-space-sm border-b border-border pb-space-md">
      <div aria-label={t("Continuar con una cuenta externa")} aria-busy={pending} className="grid grid-cols-3 gap-space-xs" role="group">
        {Object.entries(socialProviders).map(([provider, label]) => (
          <Button aria-label={`${t("Continuar con")} ${label}`} className="min-w-0 px-space-xs" disabled={pending} key={provider} name="provider" type="submit" value={provider} variant="secondary">
            {label}
          </Button>
        ))}
      </div>
      <AuthFeedback feedback={feedback} />
    </form>
  );
}
