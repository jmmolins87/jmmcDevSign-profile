import { createMockRepository } from "@/app/es/repositories/mock-repository";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type AccessRequest = {
  id: string;
  applicant: string;
  email: string;
  scope: string;
  requestedAt: string;
  status: ApprovalStatus;
};

export const approvalRepository = createMockRepository<AccessRequest, Partial<AccessRequest>>({
  seed: [
    { id: "req-001", applicant: "Lucía Martín", email: "lucia.martin@northstar.test", scope: "Editor de posts", requestedAt: "11 nov 2026 · 09:12", status: "pending" },
    { id: "req-002", applicant: "Diego Serra", email: "diego.serra@atelier.test", scope: "Demos operativas", requestedAt: "11 nov 2026 · 08:46", status: "pending" },
    { id: "req-003", applicant: "Marta Vidal", email: "marta.vidal@orbit.test", scope: "Lectura de métricas", requestedAt: "10 nov 2026 · 16:22", status: "approved" },
    { id: "req-004", applicant: "Álex Costa", email: "alex.costa@vector.test", scope: "Editor de posts", requestedAt: "10 nov 2026 · 12:09", status: "rejected" },
  ],
  create: (input, sequence) => ({
    id: `req-${sequence}`,
    applicant: input.applicant ?? "Nueva solicitud",
    email: input.email ?? "unknown@test",
    scope: input.scope ?? "Sin ámbito",
    requestedAt: input.requestedAt ?? "Ahora",
    status: input.status ?? "pending",
  }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export type PostStatus = "draft" | "review" | "published";

export type PostDraft = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: PostStatus;
  commentsEnabled: boolean;
};

export const postRepository = createMockRepository<PostDraft, Partial<PostDraft>>({
  seed: [{
    id: "post-001",
    title: "El ocaso de los microservicios caóticos",
    slug: "ocaso-microservicios-caoticos",
    excerpt: "Límites claros, velocidad de cambio y la diferencia entre distribuir datos y distribuir complejidad.",
    body: "La arquitectura no se vuelve distribuida solo porque añadamos más repositorios. Primero hay que decidir qué límites merecen existir.",
    status: "draft",
    commentsEnabled: true,
  }],
  create: (input, sequence) => ({
    id: `post-${sequence}`,
    title: input.title ?? "Nuevo post",
    slug: input.slug ?? `nuevo-post-${sequence}`,
    excerpt: input.excerpt ?? "",
    body: input.body ?? "",
    status: input.status ?? "draft",
    commentsEnabled: input.commentsEnabled ?? false,
  }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export type AgentTool = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

export type AgentConfig = {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  temperature: string;
  tools: AgentTool[];
};

export const agentRepository = createMockRepository<AgentConfig, Partial<AgentConfig>>({
  seed: [{
    id: "agent-001",
    name: "Triage operator",
    model: "gpt-5-mini",
    systemPrompt: "Clasifica cada entrada, explica la decisión y deja una traza verificable.",
    temperature: "0.2",
    tools: [
      { id: "knowledge", label: "Knowledge search", description: "Consulta el índice documental local.", enabled: true },
      { id: "crm", label: "CRM lookup", description: "Lee datos mock del CRM.", enabled: true },
      { id: "notify", label: "Notify team", description: "Prepara una notificación sin enviarla.", enabled: false },
    ],
  }],
  create: (input, sequence) => ({
    id: `agent-${sequence}`,
    name: input.name ?? "Nuevo agente",
    model: input.model ?? "gpt-5-mini",
    systemPrompt: input.systemPrompt ?? "",
    temperature: input.temperature ?? "0.2",
    tools: input.tools ?? [],
  }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export type LeadStage = "new" | "contacted" | "qualified" | "won";

export type WorkflowLead = {
  id: string;
  name: string;
  company: string;
  owner: string;
  score: number;
  stage: LeadStage;
  lastAction: string;
};

export const workflowRepository = createMockRepository<WorkflowLead, Partial<WorkflowLead>>({
  seed: [
    { id: "lead-001", name: "Nora Blanco", company: "Aster Labs", owner: "Lucía", score: 92, stage: "new", lastAction: "Formulario recibido" },
    { id: "lead-002", name: "Pablo Ríos", company: "Northstar", owner: "Diego", score: 78, stage: "contacted", lastAction: "Email abierto" },
    { id: "lead-003", name: "Irene Soler", company: "Vector Studio", owner: "Lucía", score: 88, stage: "qualified", lastAction: "Discovery completado" },
    { id: "lead-004", name: "Tomás Vidal", company: "Orbit Systems", owner: "Marta", score: 96, stage: "won", lastAction: "Propuesta aceptada" },
    { id: "lead-005", name: "Eva Costa", company: "Atelier Norte", owner: "Diego", score: 65, stage: "new", lastAction: "Importado desde CRM" },
  ],
  create: (input, sequence) => ({
    id: `lead-${sequence}`,
    name: input.name ?? "Nuevo lead",
    company: input.company ?? "Sin compañía",
    owner: input.owner ?? "Sin asignar",
    score: input.score ?? 0,
    stage: input.stage ?? "new",
    lastAction: input.lastAction ?? "Entrada recibida",
  }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export type QualificationStatus = "new" | "review" | "qualified" | "needs-info";

export type QualificationLead = {
  id: string;
  name: string;
  company: string;
  segment: string;
  score: number;
  status: QualificationStatus;
  reason: string;
};

export const qualificationRepository = createMockRepository<QualificationLead, Partial<QualificationLead>>({
  seed: [
    { id: "qual-001", name: "Nora Blanco", company: "Aster Labs", segment: "SaaS", score: 92, status: "new", reason: "Equipo de 42 personas y necesidad activa." },
    { id: "qual-002", name: "Pablo Ríos", company: "Northstar", segment: "Fintech", score: 78, status: "review", reason: "Buen encaje; falta validar calendario." },
    { id: "qual-003", name: "Irene Soler", company: "Vector Studio", segment: "Agencia", score: 88, status: "qualified", reason: "Presupuesto y decisión confirmados." },
    { id: "qual-004", name: "Tomás Vidal", company: "Orbit Systems", segment: "Industria", score: 54, status: "needs-info", reason: "Faltan datos sobre el volumen operativo." },
    { id: "qual-005", name: "Eva Costa", company: "Atelier Norte", segment: "Retail", score: 71, status: "new", reason: "Interés inicial desde la campaña editorial." },
  ],
  create: (input, sequence) => ({
    id: `qual-${sequence}`,
    name: input.name ?? "Nuevo lead",
    company: input.company ?? "Sin compañía",
    segment: input.segment ?? "Sin segmento",
    score: input.score ?? 0,
    status: input.status ?? "new",
    reason: input.reason ?? "Sin criterio todavía.",
  }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export type OrderStatus = "processing" | "ready" | "delivered";

export type MockOrder = {
  id: string;
  customer: string;
  total: number;
  status: OrderStatus;
  updatedAt: string;
  lastEvent: string;
};

export type OrderEvent = {
  id: string;
  orderId: string;
  label: string;
  at: string;
};

export type CreateOrderEventInput = Omit<OrderEvent, "id">;

export const ordersRepository = createMockRepository<MockOrder, Partial<MockOrder>>({
  seed: [
    { id: "ord-4821", customer: "Aster Labs", total: 1280, status: "processing", updatedAt: "11:42:05", lastEvent: "Pago confirmado" },
    { id: "ord-4820", customer: "Northstar", total: 760, status: "ready", updatedAt: "11:38:14", lastEvent: "Preparado para salida" },
    { id: "ord-4819", customer: "Vector Studio", total: 2140, status: "delivered", updatedAt: "11:21:48", lastEvent: "Entrega confirmada" },
    { id: "ord-4818", customer: "Orbit Systems", total: 495, status: "processing", updatedAt: "11:17:02", lastEvent: "Stock reservado" },
  ],
  create: (input, sequence) => ({
    id: `ord-${4800 + sequence}`,
    customer: input.customer ?? "Nuevo cliente",
    total: input.total ?? 0,
    status: input.status ?? "processing",
    updatedAt: input.updatedAt ?? "Ahora",
    lastEvent: input.lastEvent ?? "Pedido recibido",
  }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export const orderEventsRepository = createMockRepository<OrderEvent, CreateOrderEventInput>({
  seed: [
    { id: "evt-001", orderId: "ord-4821", label: "Pago confirmado", at: "11:42:05" },
    { id: "evt-002", orderId: "ord-4820", label: "Preparado para salida", at: "11:38:14" },
    { id: "evt-003", orderId: "ord-4819", label: "Entrega confirmada", at: "11:21:48" },
  ],
  create: (input, sequence) => ({ ...input, id: `evt-${sequence}` }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export type BackofficePeriod = "today" | "7d" | "30d";

export type BackofficeMetric = {
  id: string;
  period: BackofficePeriod;
  label: string;
  value: string;
  detail: string;
};

export const metricsRepository = createMockRepository<BackofficeMetric, Partial<BackofficeMetric>>({
  seed: [
    { id: "metric-today-revenue", period: "today", label: "Ingresos netos", value: "€24.8k", detail: "+12.4% vs. ayer" },
    { id: "metric-today-operations", period: "today", label: "Operaciones", value: "184", detail: "31 con revisión" },
    { id: "metric-today-time", period: "today", label: "Tiempo medio", value: "18m", detail: "-4m vs. objetivo" },
    { id: "metric-7d-revenue", period: "7d", label: "Ingresos netos", value: "€142.6k", detail: "+8.1% vs. periodo anterior" },
    { id: "metric-7d-operations", period: "7d", label: "Operaciones", value: "1.204", detail: "94 con revisión" },
    { id: "metric-7d-time", period: "7d", label: "Tiempo medio", value: "22m", detail: "Dentro del objetivo" },
    { id: "metric-30d-revenue", period: "30d", label: "Ingresos netos", value: "€618.2k", detail: "+14.7% vs. periodo anterior" },
    { id: "metric-30d-operations", period: "30d", label: "Operaciones", value: "5.618", detail: "311 con revisión" },
    { id: "metric-30d-time", period: "30d", label: "Tiempo medio", value: "26m", detail: "2m sobre objetivo" },
  ],
  create: (input, sequence) => ({
    id: `metric-${sequence}`,
    period: input.period ?? "today",
    label: input.label ?? "Nueva métrica",
    value: input.value ?? "0",
    detail: input.detail ?? "Sin detalle",
  }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});

export type OperationStatus = "open" | "reviewed" | "blocked";

export type Operation = {
  id: string;
  area: string;
  action: string;
  owner: string;
  status: OperationStatus;
  amount: string;
};

export const operationsRepository = createMockRepository<Operation, Partial<Operation>>({
  seed: [
    { id: "op-1001", area: "Facturación", action: "Conciliar pago recibido", owner: "Marta Vidal", status: "open", amount: "€8.420" },
    { id: "op-1002", area: "Riesgo", action: "Revisar límite de cuenta", owner: "Diego Serra", status: "blocked", amount: "€18.900" },
    { id: "op-1003", area: "Logística", action: "Confirmar expedición", owner: "Lucía Martín", status: "reviewed", amount: "€2.180" },
    { id: "op-1004", area: "Facturación", action: "Validar devolución", owner: "Marta Vidal", status: "open", amount: "€760" },
    { id: "op-1005", area: "Operaciones", action: "Reasignar cuenta enterprise", owner: "Nora Blanco", status: "reviewed", amount: "€12.600" },
  ],
  create: (input, sequence) => ({
    id: `op-${1000 + sequence}`,
    area: input.area ?? "Operaciones",
    action: input.action ?? "Nueva acción",
    owner: input.owner ?? "Sin asignar",
    status: input.status ?? "open",
    amount: input.amount ?? "€0",
  }),
  update: (current, input) => ({ ...current, ...input, id: current.id }),
});
