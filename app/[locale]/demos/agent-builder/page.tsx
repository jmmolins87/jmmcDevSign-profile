import { AgentBuilderPanel } from "@/app/[locale]/demos/agent-builder/agent-builder-panel";
import { DemoGuideProvider } from "@/app/components/demo-guide";

export default function AgentBuilderPage() {
  return (
    <DemoGuideProvider demo="agent">
      <main className="min-h-[calc(100svh-4rem)] bg-surface-lowest">
        <AgentBuilderPanel />
      </main>
    </DemoGuideProvider>
  );
}
