import {
  AgentDeploymentError,
  createAgentBuilderRepository,
  createAgentRuntimeService,
} from "@/app/[locale]/demos/agent-builder/domain";
import { describe, expect, it } from "vitest";

describe("agent builder runtime", () => {
  it("returns a deterministic response and telemetry for a prompt", async () => {
    const repository = createAgentBuilderRepository({ storage: null });
    const runtime = createAgentRuntimeService(repository);

    await expect(runtime.run({ agentId: "agent-001", prompt: "Enumera los conectores activos." })).resolves.toEqual({
      state: "idle",
      latency: "142 ms",
      tokenUsage: 56,
      messages: [
        {
          id: "message-operator-001",
          role: "operator",
          content: "Resume la arquitectura del workspace y señala el principal riesgo operativo.",
          at: "09:00:12",
          tokenUsage: 18,
        },
        {
          id: "message-agent-001",
          role: "agent",
          content: "La arquitectura separa configuración, runtime y adaptadores mock. El riesgo principal es confundir esta demo con una integración de producción.",
          at: "09:00:12",
          latency: "142 ms",
          tokenUsage: 38,
        },
        {
          id: "message-operator-1",
          role: "operator",
          content: "Enumera los conectores activos.",
          at: "09:00:12",
          tokenUsage: 18,
        },
        {
          id: "message-agent-1",
          role: "agent",
          content: "Respuesta mock: se procesó «Enumera los conectores activos.» con 3 conectores activos.",
          at: "09:00:12",
          latency: "142 ms",
          tokenUsage: 56,
        },
      ],
    });
  });

  it("deploys a valid configuration with a local version", async () => {
    const repository = createAgentBuilderRepository({ storage: null });
    const runtime = createAgentRuntimeService(repository);

    await expect(runtime.deploy("agent-001")).resolves.toMatchObject({
      version: "local-rev-4-12",
      agent: { runtimeState: "deployed", deployedVersion: "local-rev-4-12" },
    });
  });

  it("rejects deployment without changing the runtime state", async () => {
    const repository = createAgentBuilderRepository({ storage: null });
    await repository.update("agent-001", {
      name: "",
      connectors: [],
    });
    const runtime = createAgentRuntimeService(repository);

    await expect(runtime.deploy("agent-001")).rejects.toBeInstanceOf(AgentDeploymentError);
    await expect(repository.get("agent-001")).resolves.toMatchObject({ runtimeState: "idle" });
  });

  it("resets the conversation while preserving the agent configuration", async () => {
    const repository = createAgentBuilderRepository({ storage: null });
    const runtime = createAgentRuntimeService(repository);
    await runtime.run({ agentId: "agent-001", prompt: "Prueba local." });
    const beforeReset = await repository.get("agent-001");

    await expect(runtime.resetConversation("agent-001")).resolves.toMatchObject({ messages: [] });
    await expect(repository.get("agent-001")).resolves.toEqual(beforeReset);
  });
});
