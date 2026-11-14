import {
  WORKFLOW_FIXTURE,
  createWorkflowRepository,
  createWorkflowRuntimeService,
} from "@/app/es/demos/leads-workflow/domain";
import { describe, expect, it } from "vitest";

describe("leads workflow runtime", () => {
  it("selects a preset with deterministic runtime state and node status", async () => {
    const repository = createWorkflowRepository({ storage: null });
    const runtime = createWorkflowRuntimeService(repository);

    await expect(runtime.selectPreset({ workflowId: WORKFLOW_FIXTURE.id, preset: "critical-routing" })).resolves.toMatchObject({
      preset: "critical-routing",
      runtimeState: "critical",
      nodes: expect.arrayContaining([expect.objectContaining({ status: "warning" })]),
    });
  });

  it("simulates a lead through the pipeline and appends deterministic events", async () => {
    const repository = createWorkflowRepository({ storage: null });
    const runtime = createWorkflowRuntimeService(repository);

    const result = await runtime.simulateTrigger({ workflowId: WORKFLOW_FIXTURE.id });

    expect(result.lead).toMatchObject({ id: "lead-elena-rostova", relativeTime: "Ahora", lastEvent: "SLACK_DISPATCH [✓]" });
    expect(result.workflow).toMatchObject({ runtimeState: "processing", preset: "processing-event" });
    expect(result.events.map((event) => event.label)).toEqual([
      "WEBHOOK_ACCEPTED",
      "ICP_SCORE_96",
      "CRM_UPSERT_COMPLETE",
      "SLACK_DISPATCH",
    ]);
    await expect(repository.getSnapshot()).resolves.toMatchObject({ events: expect.arrayContaining([expect.objectContaining({ id: "event-simulation-1-ingest" })]) });
  });

  it("executes a test trace with one deterministic event per node", async () => {
    const repository = createWorkflowRepository({ storage: null });
    const runtime = createWorkflowRuntimeService(repository);

    await expect(runtime.executeTest({ workflowId: WORKFLOW_FIXTURE.id })).resolves.toMatchObject({
      state: "processing",
      events: expect.arrayContaining([
        expect.objectContaining({ type: "test", status: "success", latency: "4.2ms" }),
        expect.objectContaining({ type: "test", status: "success", latency: "184ms" }),
      ]),
    });
  });
});
