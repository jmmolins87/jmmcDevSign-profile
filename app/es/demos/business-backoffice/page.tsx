import { BackofficePanel } from "@/app/es/demos/business-backoffice/backoffice-panel";
import { DemoPageShell } from "@/app/es/demos/_components/demo-page-shell";

export default function BusinessBackofficePage() {
  return (
    <DemoPageShell
      allowedRoles={["admin"]}
      description="Consulta métricas de negocio, filtra la cola operativa y marca incidencias revisadas."
      eyebrow="09 / control room"
      id="business-backoffice-title"
      title="Backoffice empresarial"
      tone="base"
    >
      <BackofficePanel />
    </DemoPageShell>
  );
}
