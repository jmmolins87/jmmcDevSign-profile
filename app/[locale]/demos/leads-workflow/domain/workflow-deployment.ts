import type { WorkflowDeploymentService, WorkflowRepositorySnapshotAdapter } from "./workflow-contracts";
import { workflowRepository } from "./workflow-repository";
import { validateWorkflowForDeployment } from "./workflow-validation";
import type { WorkflowDefinition } from "./workflow-types";

export class WorkflowDeploymentError extends Error {
  constructor(public readonly validation: { valid: false; errors: string[] }) {
    super("La configuración del workflow no es válida para desplegar.");
    this.name = "WorkflowDeploymentError";
  }
}

function getDeploymentVersion(workflow: WorkflowDefinition): string {
  const revision = workflow.revision.trim().toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
  return `local-${revision || "draft"}`;
}

export function createWorkflowDeploymentService(
  repository: WorkflowRepositorySnapshotAdapter = workflowRepository,
): WorkflowDeploymentService {
  let deploymentSequence = 0;

  return {
    async validate(workflowId) {
      const workflow = await repository.getWorkflow(workflowId);
      if (!workflow) return { valid: false, errors: [`Leads Workflow not found: ${workflowId}`] };
      return validateWorkflowForDeployment(workflow);
    },

    async deploy(workflowId) {
      const workflow = await repository.getWorkflow(workflowId);
      if (!workflow) {
        throw new WorkflowDeploymentError({ valid: false, errors: [`Leads Workflow not found: ${workflowId}`] });
      }

      const validation = validateWorkflowForDeployment(workflow);
      if (!validation.valid) throw new WorkflowDeploymentError({ valid: false, errors: validation.errors });

      const version = getDeploymentVersion(workflow);
      const deployedWorkflow = await repository.updateWorkflow(workflowId, {
        runtimeState: "deployed",
        deployedVersion: version,
      });
      deploymentSequence += 1;
      await repository.appendEvent({
        id: `event-deploy-${deploymentSequence}`,
        nodeId: "node-webhook",
        type: "deploy",
        label: `DEPLOYED ${version}`,
        status: "success",
        latency: "14ms",
        at: "09:00:12",
      });

      return { workflow: deployedWorkflow, version };
    },
  };
}

export const workflowDeploymentService = createWorkflowDeploymentService();
