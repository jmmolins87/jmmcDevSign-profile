import { isSupabaseConfigured } from "@/app/lib/supabase/env";
import type { AuthAdapter, OAuthProvider } from "@/app/es/auth/contracts";

export type OAuthAuthAdapter = Pick<AuthAdapter, "signInWithOAuth">;

const providerLabels: Record<OAuthProvider, string> = {
  github: "GitHub",
  google: "Google",
};

export const mockOAuthAdapter: OAuthAuthAdapter = {
  async signInWithOAuth(provider) {
    const providerLabel = providerLabels[provider];

    if (!isSupabaseConfigured()) {
      return {
        ok: false,
        error: `${providerLabel} no está configurado localmente. Completa Supabase Auth para activar este proveedor.`,
      };
    }

    return {
      ok: false,
      error: `${providerLabel} está preparado en el contrato, pero el flujo OAuth remoto no está activado en esta demo.`,
    };
  },
};
