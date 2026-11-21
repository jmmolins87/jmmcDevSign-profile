import { BackofficePanel } from "@/app/[locale]/demos/business-backoffice/backoffice-panel";
import { DemoPageShell } from "@/app/[locale]/demos/_components/demo-page-shell";

export default async function BusinessBackofficePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const english = locale === "en";
  return (
    <DemoPageShell
      description={english ? "Inspect business metrics, filter the operations queue and review incidents." : "Consulta métricas de negocio, filtra la cola operativa y marca incidencias revisadas."}
      eyebrow={english ? "09 / control room" : "09 / sala de control"}
      id="business-backoffice-title"
      title={english ? "Business backoffice" : "Gestión empresarial"}
      tone="base"
    >
      <BackofficePanel />
    </DemoPageShell>
  );
}
