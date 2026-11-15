export const QUALIFICATION_SIMULATION_STATE_VALUES = ["standard", "qualifying", "empty", "skeleton"] as const;
export type QualificationSimulationState = (typeof QUALIFICATION_SIMULATION_STATE_VALUES)[number];

export const QUALIFICATION_TIER_VALUES = ["A", "B", "discard"] as const;
export type QualificationTier = (typeof QUALIFICATION_TIER_VALUES)[number];

export const QUALIFICATION_ORIGIN_VALUES = ["github", "web-form", "webhook-api"] as const;
export type QualificationOrigin = (typeof QUALIFICATION_ORIGIN_VALUES)[number];

export const QUALIFICATION_SEQUENCE_STATE_VALUES = ["running", "paused", "completed"] as const;
export type QualificationSequenceState = (typeof QUALIFICATION_SEQUENCE_STATE_VALUES)[number];

export const QUALIFICATION_AUDIT_EVENT_TYPE_VALUES = ["qualification", "dispatch", "assignment", "response", "sequence", "injection"] as const;
export type QualificationAuditEventType = (typeof QUALIFICATION_AUDIT_EVENT_TYPE_VALUES)[number];

export const QUALIFICATION_AUDIT_STATUS_VALUES = ["success", "warning", "error"] as const;
export type QualificationAuditStatus = (typeof QUALIFICATION_AUDIT_STATUS_VALUES)[number];

export const QUALIFICATION_TIER_FILTER_VALUES = ["all", "A", "B", "discard"] as const;
export type QualificationTierFilter = (typeof QUALIFICATION_TIER_FILTER_VALUES)[number];

export const QUALIFICATION_SNAPSHOT_VERSION = 1 as const;

export type QualificationLead = {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  origin: QualificationOrigin;
  score: number;
  tier: QualificationTier;
  budget: string;
  organizationDetail: string;
  message: string;
  evaluation: string[];
  recommendation: string;
  confidence: string;
  owner: string;
  responseDraft: string;
  sequenceState: QualificationSequenceState;
  lastEvent: string;
  relativeTime: string;
};

export type QualificationAuditEvent = {
  id: string;
  leadId?: string;
  type: QualificationAuditEventType;
  label: string;
  status: QualificationAuditStatus;
  latency: string;
  at: string;
};

export type QualificationWorkspace = {
  version: typeof QUALIFICATION_SNAPSHOT_VERSION;
  leads: QualificationLead[];
  selectedLeadId: string;
  simulationState: QualificationSimulationState;
  search: string;
  tierFilter: QualificationTierFilter;
  events: QualificationAuditEvent[];
};
