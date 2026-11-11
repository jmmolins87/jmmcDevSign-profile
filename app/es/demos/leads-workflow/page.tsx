import { DemoPageShell } from "@/app/es/demos/_components/demo-page-shell";
import { WorkflowPanel } from "@/app/es/demos/leads-workflow/workflow-panel";

export default function LeadsWorkflowPage() {
  return (
    <DemoPageShell
      allowedRoles={["admin", "editor"]}
      description="Mueve leads entre etapas, filtra por responsable y deja una traza clara de cada transición."
      eyebrow="06 / lead operations"
      id="leads-workflow-title"
      title="Flujo de leads"
    >
      <WorkflowPanel />
    </DemoPageShell>
  );
}
