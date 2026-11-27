"use client";

import { useActionState } from "react";

import { signInWithSocialProvider } from "@/app/[locale]/auth/actions";
import { initialAuthFeedback } from "@/app/[locale]/auth/managed-types";
import { isSocialProvider, socialProviders } from "@/app/[locale]/auth/social-providers";
import { useManagedAuthCopy } from "@/app/[locale]/auth/use-managed-auth-copy";
import { AuthFeedback } from "@/app/[locale]/login/auth-feedback";
import { SocialProviderLogo } from "@/app/[locale]/login/social-provider-logo";
import { Button } from "@/app/components/ui";
import { useLocale } from "@/app/lib/locale-context";

export function SocialAuthOptions() {
  const t = useManagedAuthCopy();
  const locale = useLocale();
  const [feedback, action, pending] = useActionState(signInWithSocialProvider.bind(null, locale), initialAuthFeedback);

  return (
    <form action={action} className="grid gap-space-sm border-b border-border pb-space-md">
      <div aria-label={t("Continuar con una cuenta externa")} aria-busy={pending} className="flex justify-center gap-space-sm" role="group">
        {Object.keys(socialProviders).filter(isSocialProvider).map((provider) => (
          <Button aria-label={`${t("Continuar con")} ${socialProviders[provider]}`} className={provider === "apple" ? "size-11 border-0 p-0" : "size-11 p-0"} disabled={pending} key={provider} name="provider" title={socialProviders[provider]} type="submit" value={provider} variant="secondary">
            <SocialProviderLogo provider={provider} />
          </Button>
        ))}
      </div>
      <AuthFeedback feedback={feedback} />
    </form>
  );
}
