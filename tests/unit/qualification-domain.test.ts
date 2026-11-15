import {
  QUALIFICATION_LEAD_FIXTURES,
  canApproveQualificationLead,
  createQualificationWorkspace,
  isQualificationWorkspace,
  validateQualificationWorkspace,
} from "@/app/es/demos/lead-qualification/domain";
import { describe, expect, it } from "vitest";

describe("lead qualification domain", () => {
  it("contains the five deterministic reference leads with their tiers and scores", () => {
    expect(QUALIFICATION_LEAD_FIXTURES.map((lead) => lead.name)).toEqual([
      "Elena Rostova",
      "Marcus Vance",
      "Carlos Mendonça",
      "Laura Chen",
      "David Silva",
    ]);
    expect(QUALIFICATION_LEAD_FIXTURES.map((lead) => [lead.score, lead.tier, lead.origin])).toEqual([
      [96, "A", "github"],
      [88, "A", "web-form"],
      [68, "B", "webhook-api"],
      [62, "B", "webhook-api"],
      [18, "discard", "web-form"],
    ]);
  });

  it("creates a valid workspace snapshot with a selected lead and stable telemetry", () => {
    const workspace = createQualificationWorkspace();

    expect(isQualificationWorkspace(workspace)).toBe(true);
    expect(workspace.selectedLeadId).toBe("lead-elena-rostova");
    expect(workspace.events.map((event) => event.label)).toEqual([
      "ICP_SCORE_96",
      "EMAIL_RESPONSE",
      "SEQUENCE_STARTED",
    ]);
  });

  it("rejects a snapshot with an invalid score and duplicate lead identifiers", () => {
    const workspace = createQualificationWorkspace();
    const invalidWorkspace = {
      ...workspace,
      leads: [
        { ...workspace.leads[0], score: 101 },
        { ...workspace.leads[0], id: workspace.leads[0].id },
        ...workspace.leads.slice(2),
      ],
    };

    expect(validateQualificationWorkspace(invalidWorkspace)).toEqual({
      valid: false,
      errors: [
        "El registro de leads no coincide con el contrato vigente.",
        "Los leads deben tener identificadores únicos.",
      ],
    });
  });

  it("requires a selected lead and a non-blank response before approval", () => {
    expect(canApproveQualificationLead(null)).toEqual({
      valid: false,
      errors: ["Selecciona un lead antes de aprobar la acción."],
    });
    expect(canApproveQualificationLead({ ...QUALIFICATION_LEAD_FIXTURES[0], responseDraft: "   " })).toEqual({
      valid: false,
      errors: ["La respuesta mock no puede estar vacía."],
    });
    expect(canApproveQualificationLead(QUALIFICATION_LEAD_FIXTURES[0])).toEqual({ valid: true, errors: [] });
  });
});
