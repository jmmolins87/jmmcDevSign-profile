import { SHARED_SURFACE_ROLES } from "@/app/es/auth/roles";
import { BackofficePanel } from "@/app/es/demos/business-backoffice/backoffice-panel";
import { DemoPageShell } from "@/app/es/demos/_components/demo-page-shell";

export default function BusinessBackofficePage() {
  return (
    <DemoPageShell
      allowedRoles={SHARED_SURFACE_ROLES}
      description="Consulta métricas de negocio, filtra la cola operativa y marca incidencias revisadas."
      eyebrow="09 / sala de control"
      id="business-backoffice-title"
      title="Gestión empresarial"
      tone="base"
    >
      <BackofficePanel />
    </DemoPageShell>
  );
}
