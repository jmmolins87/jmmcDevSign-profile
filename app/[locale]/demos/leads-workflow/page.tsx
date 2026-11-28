import { WorkflowPanel } from "@/app/[locale]/demos/leads-workflow/workflow-panel";
import { DemoGuideProvider } from "@/app/components/demo-guide";

export default function LeadsWorkflowPage() {
  return <DemoGuideProvider demo="workflow"><WorkflowPanel /></DemoGuideProvider>;
}
