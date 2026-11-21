import { Suspense } from "react";

import { managedAuthText } from "@/app/[locale]/auth/managed-copy";
import { readAuthFlow } from "@/app/[locale]/auth/managed-types";
import { readLoginState } from "@/app/[locale]/auth/membership-data";
import { LoginModal } from "@/app/[locale]/login/login-modal";
import type { Locale } from "@/app/lib/i18n";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function LoginRequest({ searchParams, isIntercepted }: { searchParams: SearchParams; isIntercepted: boolean }) {
  const query = await searchParams;
  const flow = readAuthFlow(query.flow);
  const state = await readLoginState(flow === "reset");
  return <LoginModal flow={flow} isIntercepted={isIntercepted} state={state} />;
}

export function LoginRoute({ locale, searchParams, isIntercepted = false }: {
  locale: Locale;
  searchParams: SearchParams;
  isIntercepted?: boolean;
}) {
  return (
    <Suspense fallback={<p className="sr-only" role="status">{managedAuthText(locale, "Consultando el estado…")}</p>}>
      <LoginRequest isIntercepted={isIntercepted} searchParams={searchParams} />
    </Suspense>
  );
}
