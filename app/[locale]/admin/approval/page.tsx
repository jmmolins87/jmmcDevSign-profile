import { Suspense } from "react";

import { SurfaceHeader } from "@/app/[locale]/_components/surface-header";
import { ApprovalPanel } from "@/app/[locale]/admin/approval/approval-panel";
import { managedAuthText } from "@/app/[locale]/auth/managed-copy";
import { isMembershipDecision, isRequestId } from "@/app/[locale]/auth/managed-types";
import { listMembershipRequests } from "@/app/[locale]/auth/membership-data";
import { ProtectedSurface } from "@/app/[locale]/auth/protected-surface";
import { RefreshAuthStatus } from "@/app/[locale]/login/pending-panel";
import { ErrorState } from "@/app/components/ui";
import { isLocale, type Locale } from "@/app/lib/i18n";
import { validateMembershipDecisionLink } from "@/app/lib/supabase/membership-operations";
import { createServerSupabaseClient } from "@/app/lib/supabase/server";
import { getEditorialAccess } from "@/app/lib/supabase/session";

const approvalRoles = ["admin"] as const;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function ApprovalRequests({ locale, searchParams }: { locale: Locale; searchParams: SearchParams }) {
  const client = await createServerSupabaseClient();
  const access = await getEditorialAccess(client);
  if (access.status !== "active" || access.role !== "admin") {
    return <ProtectedSurface access={access} allowedRoles={approvalRoles} />;
  }

  const [{ requests, queryFailed, deliveryQueryFailed }, { requestId, decision, proof }] = await Promise.all([
    listMembershipRequests(client),
    searchParams,
  ]);
  if (queryFailed) {
    return (
      <ErrorState
        action={<RefreshAuthStatus />}
        message={managedAuthText(locale, "No se pudo consultar la lista de solicitudes.")}
        title={managedAuthText(locale, "Acceso temporalmente no disponible")}
      />
    );
  }

  const link = isRequestId(requestId) && isMembershipDecision(decision) && typeof proof === "string"
    ? { requestId, decision, proof }
    : null;
  const linkSelection = link && await validateMembershipDecisionLink(client, link) ? link : null;
  return (
    <ApprovalPanel
      deliveryUnavailable={deliveryQueryFailed}
      invalidLink={(requestId !== undefined || decision !== undefined || proof !== undefined) && !linkSelection}
      key={linkSelection ? `${linkSelection.requestId}:${linkSelection.decision}` : "queue"}
      linkSelection={linkSelection}
      requests={requests}
    />
  );
}

export default async function ApprovalPage({ params, searchParams }: PageProps<"/[locale]/admin/approval">) {
  const { locale: value } = await params;
  const locale = isLocale(value) ? value : "es";
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-surface-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop">
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SurfaceHeader
          description={managedAuthText(locale, "Revisa solicitudes de acceso y confirma las decisiones de acceso editorial.")}
          eyebrow={managedAuthText(locale, "Aprobaciones")}
          id="approval-title"
          title={managedAuthText(locale, "Aprobación de accesos")}
        />
        <Suspense fallback={<p role="status">{managedAuthText(locale, "Cargando solicitudes…")}</p>}>
          <ApprovalRequests locale={locale} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
