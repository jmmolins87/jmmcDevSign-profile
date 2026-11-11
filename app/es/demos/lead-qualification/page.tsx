import { DemoPageShell } from "@/app/es/demos/_components/demo-page-shell";
import { QualificationPanel } from "@/app/es/demos/lead-qualification/qualification-panel";

export default function LeadQualificationPage() {
  return (
    <DemoPageShell
      allowedRoles={["admin", "editor"]}
      description="Evalúa el encaje de cada lead, filtra la cola y cambia el estado de cualificación con datos explicables."
      eyebrow="07 / qualification desk"
      id="lead-qualification-title"
      title="Cualificación de leads"
      tone="base"
    >
      <QualificationPanel />
    </DemoPageShell>
  );
}
