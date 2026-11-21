import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/app/lib/locale-context";
import { WorkflowPanel } from "@/app/[locale]/demos/leads-workflow/workflow-panel";
import { AgentBuilderPanel } from "@/app/[locale]/demos/agent-builder/agent-builder-panel";
import { workflowRepository } from "@/app/[locale]/demos/leads-workflow/domain";
import { agentBuilderRepository, agentRuntimeService } from "@/app/[locale]/demos/agent-builder/domain";

describe("demo walkthrough controls", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await workflowRepository.resetPlayback();
    await agentBuilderRepository.reset("agent-001");
    await agentRuntimeService.resetConversation("agent-001");
  });
  afterEach(() => vi.useRealTimers());

  it("keeps workflow idle until started, freezes in pause and restores fixtures on reset", async () => {
    await act(async () => { render(<WorkflowPanel />); });
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(screen.getByRole("progressbar", { name: "Progreso de reproducción" })).toHaveAttribute("value", "0");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Iniciar demo" })); });
    await act(() => vi.advanceTimersByTimeAsync(700));
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "20");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Pausar demo" })); });
    const paused = await workflowRepository.getSnapshot();
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect((await workflowRepository.getSnapshot()).events).toEqual(paused.events);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Reanudar demo" })); });
    await act(() => vi.advanceTimersByTimeAsync(2800));
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "100");
    expect(screen.getByText(/Recorrido completado/)).toBeVisible();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Reiniciar demo" })); });
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "0");
    expect((await workflowRepository.getSnapshot()).workflow.nodes.every((node) => node.status === "idle")).toBe(true);
  });

  it("stops the workflow at inference failure and exposes accessible recovery", async () => {
    await act(async () => { render(<WorkflowPanel />); });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /03\. ENRUTAMIENTO CRÍTICO/ })); });
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Iniciar demo" })); });
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(screen.getByRole("alert")).toHaveTextContent("Error de inferencia mock en AGENTE_IA");
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "20");
    const failed = await workflowRepository.getSnapshot();
    expect(failed.events.at(-1)).toMatchObject({ nodeId: "node-ai-agent", status: "error" });
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Reiniciar demo" })); });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar demo" })).toBeEnabled();
  });

  it("runs Agent Builder in English and preserves the working configuration controls", async () => {
    await act(async () => { render(<LocaleProvider locale="en"><AgentBuilderPanel /></LocaleProvider>); });
    expect(screen.getByRole("heading", { name: "Agent configuration" })).toBeVisible();
    expect(screen.getByLabelText(/Agent identifier \(slug\)/)).toBeEnabled();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Start demo" })); });
    await act(() => vi.advanceTimersByTimeAsync(900));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Pause demo" })); });
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(screen.getByRole("progressbar", { name: "Playback progress" })).toHaveAttribute("value", "25");
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Resume demo" })); });
    await act(() => vi.advanceTimersByTimeAsync(2700));
    expect(screen.getByRole("progressbar")).toHaveAttribute("value", "100");
    expect(screen.getByRole("button", { name: /04\. JUST DEPLOYED/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Mock response: processed/)).toBeInTheDocument();
  });

  it("translates workflow controls and keeps its technical node identifiers", async () => {
    await act(async () => { render(<LocaleProvider locale="en"><WorkflowPanel /></LocaleProvider>); });
    expect(screen.getByRole("heading", { name: "LIVE // TELEMETRY INGESTION" })).toBeVisible();
    expect(screen.getByRole("button", { name: /SIMULATE TRIGGER/ })).toBeEnabled();
    expect(screen.getAllByText("02 // AGENTE_IA").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeEnabled();
    expect(screen.queryByText("Estado")).not.toBeInTheDocument();
  });
});
