import { ProtectedSurface } from "@/app/es/auth/protected-surface";
import { SurfaceHeader } from "@/app/es/_components/surface-header";
import { AgentBuilderPanel } from "@/app/es/demos/agent-builder/agent-builder-panel";

export default function AgentBuilderPage() {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-surface-lowest px-margin py-space-2xl sm:px-margin-tablet lg:px-margin-desktop">
      <div className="mx-auto grid w-full max-w-[var(--layout-content-max)] gap-space-xl">
        <SurfaceHeader
          description="Configura un agente, decide qué herramientas puede usar y ejecuta una traza completamente mock."
          eyebrow="05 / agent builder"
          id="agent-builder-title"
          title="Constructor de agentes"
        />
        <ProtectedSurface allowedRoles={["admin", "editor"]}>
          <AgentBuilderPanel />
        </ProtectedSurface>
      </div>
    </main>
  );
}
