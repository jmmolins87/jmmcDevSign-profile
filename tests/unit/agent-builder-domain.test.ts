import {
  AGENT_CONFIG_FIXTURE,
  AGENT_RUNTIME_FIXTURE,
  createAgentBuilderFixture,
  createAgentRuntimeFixture,
  isAgentBuilderSnapshot,
  isAgentConfig,
  validateAgentForDeployment,
} from "@/app/[locale]/demos/agent-builder/domain";
import { describe, expect, it } from "vitest";

describe("agent builder domain", () => {
  it("creates the same configuration fixture without using runtime data", () => {
    expect(createAgentBuilderFixture()).toEqual(AGENT_CONFIG_FIXTURE);
    expect(createAgentRuntimeFixture()).toEqual(AGENT_RUNTIME_FIXTURE);
  });

  it("accepts the complete deterministic configuration fixture", () => {
    expect(isAgentConfig(AGENT_CONFIG_FIXTURE)).toBe(true);
  });

  it("rejects deployment when required fields are empty and no connector is active", () => {
    const result = validateAgentForDeployment({
      ...AGENT_CONFIG_FIXTURE,
      slug: "",
      name: "",
      model: "",
      contextWindow: "",
      personality: "",
      systemPrompt: "",
      connectors: AGENT_CONFIG_FIXTURE.connectors.map((connector) => ({ ...connector, enabled: false })),
    });

    expect(result).toEqual({
      valid: false,
      errors: {
        slug: "Este campo es obligatorio para desplegar el agente.",
        name: "Este campo es obligatorio para desplegar el agente.",
        model: "Este campo es obligatorio para desplegar el agente.",
        contextWindow: "Este campo es obligatorio para desplegar el agente.",
        personality: "Este campo es obligatorio para desplegar el agente.",
        systemPrompt: "Este campo es obligatorio para desplegar el agente.",
        connectors: "Activa al menos un conector antes de desplegar el agente.",
      },
    });
  });

  it("accepts deployment when required fields and one connector are present", () => {
    const result = validateAgentForDeployment(AGENT_CONFIG_FIXTURE);

    expect(result).toEqual({ valid: true, errors: {} });
  });

  it("rejects a snapshot with an unsupported runtime state", () => {
    const snapshot = {
      version: 1,
      agent: AGENT_CONFIG_FIXTURE,
      runtime: { ...AGENT_RUNTIME_FIXTURE, state: "streaming" },
    };

    expect(isAgentBuilderSnapshot(snapshot)).toBe(false);
  });
});
