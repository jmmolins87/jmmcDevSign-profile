import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { WorkflowPanel } from "@/app/es/demos/leads-workflow/workflow-panel";
import {
  WORKFLOW_LEAD_FIXTURES,
  createWorkflowFixture,
  workflowRepository,
} from "@/app/es/demos/leads-workflow/domain";

const WORKFLOW_ID = "workflow-leads-001";

async function resetPanelState(): Promise<void> {
  const workflow = createWorkflowFixture();
  await workflowRepository.updateWorkflow(WORKFLOW_ID, { ...workflow, deployedVersion: undefined });
  await workflowRepository.updateFilters({ statuses: [], origins: [], minIcpScore: null });
  for (const lead of WORKFLOW_LEAD_FIXTURES) {
    await workflowRepository.updateLead(lead.id, { ...lead });
  }
}

describe("WorkflowPanel", () => {
  beforeEach(async () => {
    await resetPanelState();
  });

  it("renders the orchestration shell, pipeline nodes and live registry", async () => {
    render(<WorkflowPanel />);

    expect(screen.getByRole("heading", { name: "EN VIVO // INGESTIÓN TELEMÉTRICA" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "[ + AÑADIR NODO ]" })).toBeInTheDocument();
    expect(screen.getAllByText("ELENA ROSTOVA").length).toBeGreaterThan(0);
    expect(screen.getAllByText("01 // WEBHOOK").length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getAllByText("MARCUS VANCE").length).toBeGreaterThan(0));
  });

  it("changes presets and exposes a live status message", async () => {
    const user = userEvent.setup();
    render(<WorkflowPanel />);

    await user.click(screen.getByRole("button", { name: /03\. ENRUTAMIENTO CRÍTICO/u }));

    expect(await screen.findByText("Preset activo: 03. ENRUTAMIENTO CRÍTICO.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /03\. ENRUTAMIENTO CRÍTICO/u })).toHaveAttribute("aria-pressed", "true");
  });

  it("simulates a trigger and runs a deterministic test trace", async () => {
    const user = userEvent.setup();
    render(<WorkflowPanel />);

    await user.click(screen.getByRole("button", { name: /SIMULAR DISPARO/u }));
    expect(await screen.findByText("Disparo simulado: pipeline completado y lead actualizado.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /EJECUTAR TEST/u }));
    expect(await screen.findByText("Test ejecutado: traza determinista disponible en el registro.")).toBeInTheDocument();
    const trace = screen.getByRole("region", { name: "Traza de auditoría" });
    expect(within(trace).getByText("01 // WEBHOOK // PASS")).toBeInTheDocument();
    const testInferenceEvent = within(trace).getByText("02 // AGENTE_IA // PASS").closest("li") as HTMLElement;
    expect(testInferenceEvent).toHaveTextContent("184ms");
  });

  it("adds fixture nodes and restores the visual layout without losing deployment data", async () => {
    const user = userEvent.setup();
    render(<WorkflowPanel />);

    await user.click(screen.getByRole("button", { name: "[ + AÑADIR NODO ]" }));
    expect(await screen.findByText("Nodo fixture añadido en una posición determinista.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Aumentar zoom" }));
    expect(screen.getByText("110%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "[ RESET GRID ]" }));
    expect(await screen.findByText("Grid restaurado: leads, eventos y despliegue se conservaron.")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("combines filters and exposes an accessible empty state", async () => {
    const user = userEvent.setup();
    render(<WorkflowPanel />);

    const registry = screen.getByRole("complementary", { name: "Registro lateral de leads" });
    await user.click(within(registry).getByRole("checkbox", { name: "Cualificado" }));
    await user.selectOptions(within(registry).getByRole("combobox", { name: /Score ICP mínimo/u }), "90");

    expect(within(registry).getByRole("button", { name: /ELENA ROSTOVA/ })).toBeInTheDocument();
    expect(within(registry).queryByRole("button", { name: /MARCUS VANCE/ })).not.toBeInTheDocument();

    await user.click(within(registry).getByRole("checkbox", { name: "Cualificado" }));
    await user.click(within(registry).getByRole("checkbox", { name: "Enrutado" }));
    expect(within(registry).getByText("Ningún lead coincide con los filtros activos.", { exact: true })).toBeInTheDocument();
  });

  it("opens and closes the mobile registry drawer with Escape", async () => {
    const user = userEvent.setup();
    render(<WorkflowPanel />);

    await user.click(screen.getByRole("button", { name: "[ ABRIR REGISTRO (4) ]" }));
    const dialog = screen.getByRole("dialog", { name: "Registro en vivo" });
    expect(dialog).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(dialog).not.toBeVisible());
  });

  it("deploys the valid workflow and exposes the deployed runtime state", async () => {
    const user = userEvent.setup();
    render(<WorkflowPanel />);

    await user.click(screen.getByRole("button", { name: /DESPLEGAR FLUJO/u }));

    expect(await screen.findByText("Workflow desplegado localmente.")).toBeInTheDocument();
    expect(screen.getByText(/DESPLEGADO/u)).toBeInTheDocument();
  });

  it("exposes accessible validation details when deployment is invalid", async () => {
    const user = userEvent.setup();
    await workflowRepository.updateWorkflow(WORKFLOW_ID, { name: "", nodes: [], edges: [] });
    render(<WorkflowPanel />);

    await user.click(screen.getByRole("button", { name: /DESPLEGAR FLUJO/u }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("La configuración del workflow no es válida para desplegar.");
    expect(alert).toHaveTextContent("El workflow necesita un nombre.");
    expect(alert).toHaveTextContent("Falta el nodo requerido: webhook.");
    expect(alert).toHaveTextContent("Falta el nodo requerido: ai-agent.");
    expect(alert).toHaveTextContent("El workflow necesita conexiones entre nodos.");
  });
});
