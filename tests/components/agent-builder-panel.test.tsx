import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { AgentBuilderPanel } from "@/app/[locale]/demos/agent-builder/agent-builder-panel";
import {
  agentBuilderRepository,
  agentRuntimeService,
} from "@/app/[locale]/demos/agent-builder/domain";

describe("AgentBuilderPanel", () => {
  beforeEach(async () => {
    await agentBuilderRepository.reset("agent-001");
    await agentRuntimeService.resetConversation("agent-001");
  });

  it("renders the configuration surface and updates connector counts", async () => {
    const user = userEvent.setup();
    render(<AgentBuilderPanel />);

    expect(screen.getByRole("heading", { name: "Configuración del agente" })).toBeInTheDocument();
    expect(screen.getByText("[ 3 / 4 ACTIVOS ]")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /Llamada a endpoints REST/u }));

    expect(screen.getByText("[ 4 / 4 ACTIVOS ]")).toBeInTheDocument();
  });

  it("adds and removes a mock knowledge source without external access", async () => {
    const user = userEvent.setup();
    render(<AgentBuilderPanel />);

    await user.click(screen.getByRole("button", { name: /AÑADIR FUENTE/u }));
    expect(screen.getByRole("dialog", { name: "Añadir fuente mock" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Tipo de fuente"), "URL");
    await user.type(screen.getByLabelText(/Referencia local/u), "https://mock.local/manual");
    await user.click(screen.getByRole("button", { name: "Registrar fuente" }));

    expect(screen.getByText("manual")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Eliminar fuente manual" }));
    expect(screen.queryByText("manual")).not.toBeInTheDocument();
  });

  it("shows accessible validation errors and blocks invalid deployment", async () => {
    const user = userEvent.setup();
    render(<AgentBuilderPanel />);

    await user.clear(screen.getByLabelText(/Identificador de agente \(slug\)/u));
    await user.click(screen.getByRole("button", { name: /VALIDAR SCHEMA/u }));

    expect(screen.getByRole("alert")).toHaveTextContent("obligatorio");
    expect(screen.getByLabelText(/Identificador de agente \(slug\)/u)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("button", { name: /01\. EN ESPERA/u })).toHaveAttribute("aria-pressed", "true");
  });

  it("deploys a valid configuration and exposes the local version", async () => {
    const user = userEvent.setup();
    render(<AgentBuilderPanel />);

    await user.click(screen.getByRole("button", { name: /DESPLEGAR AGENTE/u }));

    expect(await screen.findByText(/local-rev-4-12/u)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /04\. RECIÉN DESPLEGADO/u })).toHaveAttribute("aria-pressed", "true");
  });

  it("runs a quick prompt and resets only the conversation", async () => {
    const user = userEvent.setup();
    render(<AgentBuilderPanel />);

    await user.click(screen.getByRole("button", { name: "Enumera los conectores activos." }));
    expect(await screen.findByText(/Respuesta mock: se procesó/u)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /REINICIAR CONVERSACIÓN/u }));
    expect(screen.getByText("Buffer vacío. Envía un prompt para iniciar una traza mock.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Identificador de agente \(slug\)/u)).toHaveValue("architect-core-v2");
  });

  it("selects each runtime state from the live matrix", async () => {
    const user = userEvent.setup();
    render(<AgentBuilderPanel />);

    await user.click(screen.getByRole("button", { name: /03\. ERROR DE INFERENCIA/u }));
    await waitFor(() => expect(screen.getByRole("button", { name: /03\. ERROR DE INFERENCIA/u })).toHaveAttribute("aria-pressed", "true"));
    expect(screen.getByText("Estado operativo cambiado a error de inferencia.")).toBeInTheDocument();
  });

  it("keeps the prompt field editable through a native form control", () => {
    render(<AgentBuilderPanel />);

    fireEvent.change(screen.getByLabelText("Prompt de prueba"), { target: { value: "Diagnóstico local" } });

    expect(screen.getByLabelText("Prompt de prueba")).toHaveValue("Diagnóstico local");
  });

  it("submits a typed prompt and renders its deterministic response", async () => {
    const user = userEvent.setup();
    render(<AgentBuilderPanel />);

    const promptInput = screen.getByLabelText("Prompt de prueba");
    await user.type(promptInput, "Diagnóstico manual");
    await user.click(screen.getByRole("button", { name: "Enviar prompt" }));

    expect(await screen.findByText("Respuesta mock: se procesó «Diagnóstico manual» con 3 conectores activos.")).toBeInTheDocument();
    expect(promptInput).toHaveValue("");
    expect(screen.getByText("RESPUESTA MOCK LISTA.")).toBeInTheDocument();
  });

  it("supports keyboard tab activation and exposes live/error feedback", async () => {
    const user = userEvent.setup();
    render(<AgentBuilderPanel />);

    const runtimeTab = screen.getByRole("tab", { name: "[ PROBAR (CHAT) ]" });
    runtimeTab.focus();
    await user.keyboard("{Enter}");

    expect(runtimeTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("log", { name: "Traza de conversación del agente" })).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("status")).toHaveTextContent("Núcleo determinista activo");

    await user.click(screen.getByRole("button", { name: /03\. ERROR DE INFERENCIA/u }));
    expect(screen.getByRole("alert")).toHaveTextContent("La inferencia se detuvo");
  });
});
