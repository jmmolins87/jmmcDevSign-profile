import {
  QUALIFICATION_TEST_LEAD_FIXTURE,
  createQualificationRepository,
  createQualificationRuntimeService,
  filterQualificationLeads,
} from "@/app/es/demos/lead-qualification/domain";
import { describe, expect, it } from "vitest";

describe("lead qualification runtime", () => {
  it("filters leads by tier and normalized name, company or score", async () => {
    const repository = createQualificationRepository({ storage: null });
    const workspace = await repository.getWorkspace();

    expect(filterQualificationLeads(workspace.leads, { search: "mendonca", tierFilter: "B" }).map((lead) => lead.id)).toEqual(["lead-carlos-mendonca"]);
    expect(filterQualificationLeads(workspace.leads, { search: "96", tierFilter: "all" }).map((lead) => lead.id)).toEqual(["lead-elena-rostova"]);
    expect(filterQualificationLeads(workspace.leads, { search: "", tierFilter: "A" }).map((lead) => lead.id)).toEqual(["lead-elena-rostova", "lead-marcus-vance"]);
  });

  it("selects a lead and changes the simulator state without external effects", async () => {
    const repository = createQualificationRepository({ storage: null });
    const runtime = createQualificationRuntimeService(repository);

    await runtime.selectLead({ leadId: "lead-laura-chen" });
    const workspace = await runtime.setSimulationState({ state: "qualifying" });

    expect(workspace).toMatchObject({ selectedLeadId: "lead-laura-chen", simulationState: "qualifying" });
  });

  it("injects Victor Kline with score 94 once and keeps the transition deterministic", async () => {
    const repository = createQualificationRepository({ storage: null });
    const runtime = createQualificationRuntimeService(repository);

    const firstResult = await runtime.injectTestLead();
    const secondResult = await runtime.injectTestLead();

    expect(firstResult.lead).toMatchObject(QUALIFICATION_TEST_LEAD_FIXTURE);
    expect(secondResult.workspace.simulationState).toBe("qualifying");
    expect(secondResult.workspace.leads.filter((lead) => lead.id === "lead-victor-kline")).toHaveLength(1);
    expect(secondResult.workspace.events.filter((event) => event.id === "qualification-injection-victor-kline")).toHaveLength(1);
  });

  it("approves a non-blank response once and does not duplicate dispatch events", async () => {
    const repository = createQualificationRepository({ storage: null });
    const runtime = createQualificationRuntimeService(repository);

    const firstResult = await runtime.approveAction({ leadId: "lead-elena-rostova" });
    const secondResult = await runtime.approveAction({ leadId: "lead-elena-rostova" });
    const workspace = await repository.getWorkspace();

    expect(firstResult.lead.lastEvent).toBe("DISPATCH_APPROVED [✓]");
    expect(secondResult.event.id).toBe(firstResult.event.id);
    expect(workspace.events.filter((event) => event.id === "dispatch-approved-lead-elena-rostova")).toHaveLength(1);
  });

  it("rejects blank responses and owners outside the local catalog", async () => {
    const repository = createQualificationRepository({ storage: null });
    const runtime = createQualificationRuntimeService(repository);

    await expect(runtime.updateResponse({ leadId: "lead-elena-rostova", responseDraft: "   " })).rejects.toThrow("no puede estar vacía");
    await expect(runtime.reassignLead({ leadId: "lead-elena-rostova", owner: "External CRM" })).rejects.toThrow("catálogo local");
  });

  it("updates only the requested lead when editing ownership, response and sequence", async () => {
    const repository = createQualificationRepository({ storage: null });
    const runtime = createQualificationRuntimeService(repository);

    await runtime.reassignLead({ leadId: "lead-marcus-vance", owner: "Nora Vidal" });
    await runtime.updateResponse({ leadId: "lead-marcus-vance", responseDraft: "Respuesta revisada" });
    const updatedLead = await runtime.toggleSequence({ leadId: "lead-marcus-vance" });
    const workspace = await repository.getWorkspace();

    expect(updatedLead).toMatchObject({ owner: "Nora Vidal", responseDraft: "Respuesta revisada", sequenceState: "paused" });
    expect(workspace.leads.find((lead) => lead.id === "lead-elena-rostova")).toMatchObject({
      owner: "Juanma / JMMC Studio",
      sequenceState: "running",
    });
  });
});
