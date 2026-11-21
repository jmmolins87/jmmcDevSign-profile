import {
  WORKFLOW_FIXTURE,
  WorkflowDeploymentError,
  createWorkflowDeploymentService,
  createWorkflowRepository,
} from "@/app/[locale]/demos/leads-workflow/domain";
import { describe, expect, it } from "vitest";

describe("leads workflow deployment", () => {
  it("validates and deploys a valid workflow with a deterministic local version", async () => {
    const repository = createWorkflowRepository({ storage: null });
    const deployment = createWorkflowDeploymentService(repository);

    await expect(deployment.validate(WORKFLOW_FIXTURE.id)).resolves.toEqual({ valid: true, errors: [] });
    await expect(deployment.deploy(WORKFLOW_FIXTURE.id)).resolves.toMatchObject({
      version: "local-rev-2-4-9",
      workflow: { runtimeState: "deployed", deployedVersion: "local-rev-2-4-9" },
    });
    await expect(repository.getSnapshot()).resolves.toMatchObject({ events: expect.arrayContaining([expect.objectContaining({ type: "deploy", status: "success" })]) });
  });

  it("rejects invalid deployment without changing the runtime state", async () => {
    const repository = createWorkflowRepository({ storage: null });
    await repository.updateWorkflow(WORKFLOW_FIXTURE.id, { name: "", nodes: [] });
    const deployment = createWorkflowDeploymentService(repository);

    await expect(deployment.deploy(WORKFLOW_FIXTURE.id)).rejects.toBeInstanceOf(WorkflowDeploymentError);
    const workflow = await repository.getWorkflow(WORKFLOW_FIXTURE.id);
    expect(workflow).toMatchObject({ runtimeState: "live" });
    expect(workflow).not.toHaveProperty("deployedVersion");
  });
});
