import {
  QUALIFICATION_AUDIT_EVENT_TYPE_VALUES,
  QUALIFICATION_AUDIT_STATUS_VALUES,
  QUALIFICATION_ORIGIN_VALUES,
  QUALIFICATION_SEQUENCE_STATE_VALUES,
  QUALIFICATION_SIMULATION_STATE_VALUES,
  QUALIFICATION_SNAPSHOT_VERSION,
  QUALIFICATION_TIER_FILTER_VALUES,
  QUALIFICATION_TIER_VALUES,
  type QualificationAuditEvent,
  type QualificationLead,
  type QualificationWorkspace,
} from "./qualification-types";

export const QUALIFICATION_OWNER_OPTIONS = ["Juanma / JMMC Studio", "Marta Ruiz", "Nora Vidal", "Equipo de arquitectura"] as const;
export type QualificationOwner = (typeof QUALIFICATION_OWNER_OPTIONS)[number];

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isUniqueStringList(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

function isFiniteScore(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

export function isQualificationSimulationState(value: unknown): value is QualificationWorkspace["simulationState"] {
  return typeof value === "string" && QUALIFICATION_SIMULATION_STATE_VALUES.includes(value as QualificationWorkspace["simulationState"]);
}

export function isQualificationTier(value: unknown): value is QualificationLead["tier"] {
  return typeof value === "string" && QUALIFICATION_TIER_VALUES.includes(value as QualificationLead["tier"]);
}

export function isQualificationOrigin(value: unknown): value is QualificationLead["origin"] {
  return typeof value === "string" && QUALIFICATION_ORIGIN_VALUES.includes(value as QualificationLead["origin"]);
}

export function isQualificationSequenceState(value: unknown): value is QualificationLead["sequenceState"] {
  return typeof value === "string" && QUALIFICATION_SEQUENCE_STATE_VALUES.includes(value as QualificationLead["sequenceState"]);
}

export function isQualificationAuditEventType(value: unknown): value is QualificationAuditEvent["type"] {
  return typeof value === "string" && QUALIFICATION_AUDIT_EVENT_TYPE_VALUES.includes(value as QualificationAuditEvent["type"]);
}

export function isQualificationAuditStatus(value: unknown): value is QualificationAuditEvent["status"] {
  return typeof value === "string" && QUALIFICATION_AUDIT_STATUS_VALUES.includes(value as QualificationAuditEvent["status"]);
}

export function isQualificationTierFilter(value: unknown): value is QualificationWorkspace["tierFilter"] {
  return typeof value === "string" && QUALIFICATION_TIER_FILTER_VALUES.includes(value as QualificationWorkspace["tierFilter"]);
}

export function isQualificationOwner(value: unknown): value is QualificationOwner {
  return typeof value === "string" && QUALIFICATION_OWNER_OPTIONS.includes(value as QualificationOwner);
}

export function isQualificationLead(value: unknown): value is QualificationLead {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.role === "string" &&
    typeof value.company === "string" &&
    typeof value.email === "string" &&
    typeof value.phone === "string" &&
    typeof value.phoneVerified === "boolean" &&
    isQualificationOrigin(value.origin) &&
    isFiniteScore(value.score) &&
    isQualificationTier(value.tier) &&
    typeof value.budget === "string" &&
    typeof value.organizationDetail === "string" &&
    typeof value.message === "string" &&
    isStringArray(value.evaluation) &&
    typeof value.recommendation === "string" &&
    typeof value.confidence === "string" &&
    typeof value.owner === "string" &&
    typeof value.responseDraft === "string" &&
    isQualificationSequenceState(value.sequenceState) &&
    typeof value.lastEvent === "string" &&
    typeof value.relativeTime === "string"
  );
}

export function isQualificationAuditEvent(value: unknown): value is QualificationAuditEvent {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    (value.leadId === undefined || typeof value.leadId === "string") &&
    isQualificationAuditEventType(value.type) &&
    typeof value.label === "string" &&
    isQualificationAuditStatus(value.status) &&
    typeof value.latency === "string" &&
    typeof value.at === "string"
  );
}

export function validateQualificationWorkspace(value: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isRecord(value)) {
    return { valid: false, errors: ["El workspace debe ser un objeto."] };
  }

  if (value.version !== QUALIFICATION_SNAPSHOT_VERSION) errors.push("La versión del snapshot no coincide con el contrato vigente.");
  if (!Array.isArray(value.leads) || !value.leads.every(isQualificationLead)) errors.push("El registro de leads no coincide con el contrato vigente.");
  if (Array.isArray(value.leads)) {
    const leadIds = value.leads.map((lead) => (isRecord(lead) && typeof lead.id === "string" ? lead.id : ""));
    if (!isUniqueStringList(leadIds) || leadIds.includes("")) errors.push("Los leads deben tener identificadores únicos.");
  }
  if (typeof value.selectedLeadId !== "string") errors.push("La selección debe ser un identificador o estar vacía.");
  if (typeof value.selectedLeadId === "string" && Array.isArray(value.leads)) {
    const leadIds = value.leads.filter(isQualificationLead).map((lead) => lead.id);
    if (value.selectedLeadId !== "" && !leadIds.includes(value.selectedLeadId)) errors.push("El lead seleccionado no existe en el registro.");
  }
  if (!isQualificationSimulationState(value.simulationState)) errors.push("El estado del simulador no es válido.");
  if (typeof value.search !== "string") errors.push("La búsqueda debe ser texto.");
  if (!isQualificationTierFilter(value.tierFilter)) errors.push("El filtro de tier no es válido.");
  if (!Array.isArray(value.events) || !value.events.every(isQualificationAuditEvent)) errors.push("La telemetría no coincide con el contrato vigente.");
  if (Array.isArray(value.events)) {
    const eventIds = value.events.map((event) => (isRecord(event) && typeof event.id === "string" ? event.id : ""));
    if (!isUniqueStringList(eventIds) || eventIds.includes("")) errors.push("Los eventos deben tener identificadores únicos.");
  }

  return { valid: errors.length === 0, errors };
}

export function isQualificationWorkspace(value: unknown): value is QualificationWorkspace {
  return validateQualificationWorkspace(value).valid;
}

export function isNonBlankText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function canApproveQualificationLead(lead: QualificationLead | null): { valid: boolean; errors: string[] } {
  if (!lead) return { valid: false, errors: ["Selecciona un lead antes de aprobar la acción."] };
  if (!isNonBlankText(lead.responseDraft)) return { valid: false, errors: ["La respuesta mock no puede estar vacía."] };
  return { valid: true, errors: [] };
}

function normalizeSearchValue(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-ES");
}

export function filterQualificationLeads(
  leads: readonly QualificationLead[],
  filters: Pick<QualificationWorkspace, "search" | "tierFilter">,
): QualificationLead[] {
  const search = normalizeSearchValue(filters.search.trim());

  return leads.filter((lead) => {
    const matchesTier = filters.tierFilter === "all" || lead.tier === filters.tierFilter;
    if (!matchesTier) return false;
    if (!search) return true;

    return [lead.name, lead.company, String(lead.score)].some((value) => normalizeSearchValue(value).includes(search));
  });
}
