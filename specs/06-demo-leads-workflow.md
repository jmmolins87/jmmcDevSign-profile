# SPEC 06 — Reconstrucción fiel de la demo Leads Workflow

> **Status:** Approved
> **Depends on:** SPEC 01
> **Date:** 2026-11-14
> **Objective:** Sustituir la demo reducida de `/es/demos/leads-workflow` por una superficie de orquestación de leads fiel a `resources/06_demo_leads_workflow`, manteniendo todos los datos y flujos en mocks y dejando contratos preparados para una integración futura de producción.

## Scope

**In:**

- Reconstruir la superficie visual de `resources/06_demo_leads_workflow/screen.png` y `code.html`.
- Adoptar el shell propio de la referencia: header fijo, command bar, telemetría, presets, canvas, registro lateral y footer.
- Mantener la ruta `/es/demos/leads-workflow` pública, sin exigir sesión ni rol.
- Sustituir el kanban actual por un pipeline mock de ingestión, análisis IA, CRM/Postgres y notificación.
- Implementar nodos visuales, conexiones ortogonales, terminales, estados operativos y metadatos técnicos deterministas.
- Implementar los presets `EN VIVO`, `PROCESANDO EVENTO`, `ENRUTAMIENTO CRÍTICO` y `VISTA MATRIX (DEBUG)`.
- Implementar las acciones `[ SIMULAR DISPARO ]`, `[ EJECUTAR TEST ]`, `[ + AÑADIR NODO ]`, `[ RESET GRID ]`, `[ AUTO-ALIGN ]` y controles de zoom.
- Implementar un evento simulado determinista que recorra el pipeline, actualice un lead y añada una traza al registro.
- Implementar la creación local de nodos mock desde fixtures con posiciones deterministas.
- Implementar un registro lateral con cuatro fixtures iniciales, detalle de lead, estado, score ICP, origen, owner y eventos de auditoría.
- Implementar filtros combinables por estado, score ICP y origen, incluyendo estados vacíos accesibles.
- Implementar `[ DESPLEGAR FLUJO ]` con validación, versión local determinista, estado desplegado y confirmación mock.
- Persistir workflow, nodos añadidos, leads, eventos, preset, filtros y despliegue en `localStorage` mediante un snapshot versionado.
- Recuperar fixtures seguros cuando el snapshot local sea inválido, incompatible o no pueda parsearse.
- Mantener contratos de dominio y adaptadores mock separados de React, `localStorage` y proveedores externos.
- Mantener los textos técnicos de la referencia como metadata mock: `CLAUDE 3.5`, `AWS_ORCHESTRATOR_EKS`, `HUBSPOT`, `SLACK` y similares.
- Mantener la dirección visual brutalista editorial: tipografías, tokens, hairlines, geometría cuadrada, densidad y uso limitado del naranja.
- Adaptar la composición a 375px y 1440px; en móvil el canvas aparece primero y el registro se abre en un drawer accesible.
- Mantener navegación por teclado, foco visible, nombres accesibles, regiones vivas y `prefers-reduced-motion`.
- Añadir tests unitarios, de componentes y E2E para dominio, presets, acciones, persistencia, filtros, despliegue, accesibilidad y responsive.

**Out of scope (for future specs):**

- Conectar Supabase, una API propia, AWS, HubSpot, Slack o cualquier proveedor externo.
- Ejecutar llamadas HTTP, webhooks reales, búsquedas documentales o consultas CRM reales.
- Ejecutar inferencia LLM real o enviar notificaciones reales.
- Crear tablas, migraciones, políticas RLS o persistencia remota.
- Implementar autenticación o permisos nuevos por acción.
- Ejecutar despliegues reales, workers, colas, cron jobs o telemetría de producción.
- Añadir colaboración multiusuario, edición concurrente, multi-workspace o gestión de varios workflows.
- Añadir un editor visual libre con drag and drop o posiciones arbitrarias persistidas.
- Añadir integración con la demo actual de cualificación de leads más allá de compartir fixtures conceptuales.
- Añadir nuevas dependencias sin autorización explícita.

## Data model

La implementación mantiene un workspace mock persistente. Los contratos no dependen de React, `localStorage`, Supabase ni de proveedores externos.

### Workflow

```ts
type WorkflowRuntimeState =
  | "live"
  | "processing"
  | "critical"
  | "matrix"
  | "deployed";

type WorkflowPreset =
  | "live-monitoring"
  | "processing-event"
  | "critical-routing"
  | "matrix-debug";

type WorkflowNodeType =
  | "webhook"
  | "ai-agent"
  | "crm"
  | "email"
  | "slack";

type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  label: string;
  providerLabel: string;
  status: "idle" | "active" | "warning" | "error";
  position: { x: number; y: number };
  metadata: Record<string, string>;
};

type WorkflowEdge = {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  status: "idle" | "active" | "warning";
};

type WorkflowDefinition = {
  id: string;
  name: string;
  revision: string;
  runtimeState: WorkflowRuntimeState;
  preset: WorkflowPreset;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  deployedVersion?: string;
  updatedAt: string;
};
```

### Leads and registro

```ts
type LeadWorkflowStatus =
  | "new"
  | "qualified"
  | "routed"
  | "discarded";

type LeadOrigin =
  | "github-repo"
  | "landing-form"
  | "api-inbound"
  | "linked-mcp";

type WorkflowLeadRecord = {
  id: string;
  name: string;
  role: string;
  company: string;
  origin: LeadOrigin;
  owner: string;
  budget?: string;
  stack?: string;
  icpScore: number;
  tier: string;
  status: LeadWorkflowStatus;
  reason?: string;
  dealId?: string;
  lastEvent: string;
  relativeTime: string;
};

type WorkflowAuditEvent = {
  id: string;
  leadId?: string;
  nodeId?: string;
  type: "ingest" | "inference" | "route" | "notification" | "test" | "deploy";
  label: string;
  status: "success" | "warning" | "error";
  latency: string;
  at: string;
};
```

El runtime mock usará fixtures deterministas. No debe usar reloj real, aleatoriedad, red ni respuestas generadas por un proveedor externo.

### Contratos

```ts
interface WorkflowRepository {
  getWorkflow(id: string): Promise<WorkflowDefinition | null>;
  updateWorkflow(id: string, input: Partial<WorkflowDefinition>): Promise<WorkflowDefinition>;
  listLeads(): Promise<WorkflowLeadRecord[]>;
  updateLead(id: string, input: Partial<WorkflowLeadRecord>): Promise<WorkflowLeadRecord>;
  appendEvent(event: WorkflowAuditEvent): Promise<WorkflowAuditEvent>;
  addNode(input: Omit<WorkflowNode, "id">): Promise<WorkflowNode>;
  resetWorkspace(id: string): Promise<WorkflowDefinition>;
}

interface WorkflowRuntimeService {
  simulateTrigger(input: { workflowId: string }): Promise<{
    workflow: WorkflowDefinition;
    lead: WorkflowLeadRecord;
    events: WorkflowAuditEvent[];
  }>;
  executeTest(input: { workflowId: string }): Promise<{
    state: WorkflowRuntimeState;
    events: WorkflowAuditEvent[];
  }>;
  selectPreset(input: { workflowId: string; preset: WorkflowPreset }): Promise<WorkflowDefinition>;
}

interface WorkflowDeploymentService {
  validate(workflowId: string): Promise<{ valid: boolean; errors: string[] }>;
  deploy(workflowId: string): Promise<{ workflow: WorkflowDefinition; version: string }>;
}
```

Los componentes consumen estos contratos y no acceden directamente a fixtures, `localStorage` ni proveedores externos.

### Validación

El despliegue exige un workflow con nombre, revisión, al menos un nodo de ingestión, un nodo de procesamiento y un nodo de salida, además de conexiones válidas entre nodos. Los errores se muestran en una región accesible y no se cambia a `deployed` si la configuración no es válida.

## Implementation plan

1. Crear los tipos, estados, presets, fixtures, contratos y validadores del dominio Leads Workflow.
2. Implementar el repositorio mock persistente con snapshot versionado, validación de esquema, recuperación segura y reset visual.
3. Implementar el runtime mock para presets, simulación de eventos, ejecución de tests, trazas y transiciones deterministas.
4. Implementar el servicio de despliegue mock con validación, versión local y auditoría.
5. Sustituir el panel actual por el shell completo de la referencia, reutilizando tokens y primitivas UI existentes.
6. Implementar header, command bar, telemetría, presets, HUD de canvas, nodos, conexiones y footer operativo.
7. Implementar zoom, reset grid, auto-align y alta de nodos desde fixtures sin permitir posiciones arbitrarias.
8. Implementar registro de leads, filtros combinables, detalle, estados vacíos, scroll y drawer móvil.
9. Implementar simulación determinista, ejecución de test, feedback `aria-live`, estados de error y recuperación.
10. Implementar validación y despliegue mock con versión local y confirmación accesible.
11. Verificar responsive, teclado, foco visible, semántica, drawer, reduced motion y ausencia de llamadas de red.
12. Añadir tests unitarios y de componentes para dominio, repositorio, runtime, despliegue, filtros y controles.
13. Actualizar el flujo E2E de la demo a 375px y 1440px.
14. Ejecutar lint, typecheck, tests, build, E2E y validación estricta de OpenSpec.
15. Documentar la frontera futura de producción sin introducir integraciones remotas ni dependencias nuevas.

## Acceptance criteria

- [ ] `/es/demos/leads-workflow` reproduce la composición principal de `screen.png` sin errores de runtime.
- [ ] La superficie incluye header fijo, command bar, telemetría, presets, canvas, registro lateral y footer.
- [ ] El canvas muestra nodos de ingestión, IA, CRM/Postgres y notificación con conexiones visibles.
- [ ] Los nodos, conexiones y metadatos técnicos conservan la dirección visual de la referencia.
- [ ] Los presets `EN VIVO`, `PROCESANDO EVENTO`, `ENRUTAMIENTO CRÍTICO` y `VISTA MATRIX (DEBUG)` cambian el estado de forma reproducible.
- [ ] `[ SIMULAR DISPARO ]` ejecuta el pipeline mock, actualiza un lead y añade eventos al registro.
- [ ] `[ EJECUTAR TEST ]` ejecuta una traza determinista y muestra resultados de nodos y latencias mock.
- [ ] `[ + AÑADIR NODO ]` permite añadir nodos fixture al canvas y registra el cambio localmente.
- [ ] `[ RESET GRID ]` restaura zoom y posiciones iniciales sin borrar leads, eventos ni despliegue.
- [ ] `[ AUTO-ALIGN ]` aplica las posiciones deterministas definidas por el layout mock.
- [ ] Los controles de zoom cambian la escala visible sin modificar el modelo de dominio.
- [ ] El registro inicial contiene cuatro leads equivalentes a la referencia, con score ICP, origen, estado y metadata.
- [ ] Los filtros combinables por estado, score ICP y origen actualizan el registro sin llamadas externas.
- [ ] El registro muestra estado vacío accesible cuando ningún lead coincide.
- [ ] El registro se puede abrir y cerrar mediante un drawer accesible en 375px.
- [ ] `[ DESPLEGAR FLUJO ]` valida el workflow, genera una versión local determinista y muestra confirmación.
- [ ] Un workflow inválido no se despliega y muestra errores accesibles.
- [ ] El workflow, leads, nodos, eventos, preset, filtros y despliegue se recuperan tras recargar mediante `localStorage` versionado.
- [ ] Un snapshot corrupto o incompatible se descarta, restaura fixtures seguros y muestra feedback no bloqueante.
- [ ] La UI conserva los tokens, tipografías, hairlines, geometría cuadrada, densidad y acento naranja de la dirección visual.
- [ ] La UI funciona a 375px y 1440px sin pérdida de controles principales.
- [ ] La ruta es accesible para usuarios anónimos y autenticados sin exigir cuenta ni rol.
- [ ] Los controles tienen nombre accesible, foco visible, navegación por teclado y feedback en regiones vivas.
- [ ] El drawer implementa foco y cierre accesibles sin bloquear el contenido de forma permanente.
- [ ] Las animaciones respetan `prefers-reduced-motion`.
- [ ] Existen contratos independientes de la UI para repositorio, runtime y despliegue.
- [ ] No existen llamadas de red, proveedores reales, migraciones, secretos ni persistencia remota.
- [ ] `pnpm lint` pasa.
- [ ] `pnpm typecheck` pasa.
- [ ] `pnpm test` pasa.
- [ ] `pnpm build` pasa.
- [ ] `pnpm test:e2e` pasa en móvil y escritorio.
- [ ] `openspec validate 06-demo-leads-workflow --type change --strict` pasa.

## Traceability

| Requirement | Task | Test | Verification |
| --- | --- | --- | --- |
| REQ-001–004 | TASK-005, TASK-006, TASK-007 | TEST-001, TEST-002 | VERIFY-PASS |
| REQ-005–006 | TASK-008, TASK-009 | TEST-003, TEST-004 | VERIFY-PASS |
| REQ-007 | TASK-002 | TEST-005 | VERIFY-PASS |
| REQ-008 | TASK-001, TASK-003, TASK-004 | TEST-006 | VERIFY-PASS |
| REQ-009 | TASK-011, TASK-013 | TEST-007 | VERIFY-PASS |
| REQ-010 | TASK-012, TASK-014 | TEST-008 | VERIFY-PASS |

## Decisions

- **Sí:** reconstrucción fiel de la referencia, no solo pulido del kanban actual.
- **Sí:** shell propio de la demo aunque se aparte del `DemoPageShell` genérico.
- **Sí:** flujo completo mock para nodos, presets, simulación, test, registro, filtros y despliegue.
- **Sí:** la demo representa una orquestación completa de leads y sustituye el flujo kanban actual.
- **Sí:** todos los controles visibles tendrán comportamiento mock verificable.
- **Sí:** la simulación usará fixtures deterministas y avanzará por etapas del pipeline.
- **Sí:** el despliegue validará y generará una versión local sin publicar nada externamente.
- **Sí:** usar puertos de dominio y adaptadores mock, sin contratos HTTP ni acoplamiento a Supabase en esta fase.
- **Sí:** mantener los nombres técnicos y proveedores de la referencia como metadata ficticia.
- **Sí:** mantener la ruta pública y sin permisos nuevos por acción.
- **Sí:** persistir el workspace en `localStorage` versionado.
- **Sí:** el registro móvil se resolverá mediante drawer y el canvas aparecerá primero.
- **Sí:** el fixture inicial replicará los cuatro registros visibles de la referencia.
- **No:** conectar proveedores reales, ejecutar inferencia real, enviar notificaciones o desplegar workflows reales.

## Risks

| Risk | Mitigation |
| --- | --- |
| La referencia contiene una superficie mucho más densa que la demo actual | Dividir la implementación por shell, dominio, canvas, registro y acciones verificables. |
| Los nombres de proveedores pueden parecer integraciones reales | Etiquetar el comportamiento como mock y mantener adaptadores sin red. |
| La densidad del canvas puede romperse en móvil | Priorizar canvas sobre registro y usar drawer accesible para el inspector. |
| El snapshot local puede estar corrupto o desactualizado | Versionar el snapshot, validar estructura y restaurar fixtures seguros. |
| La simulación puede producir tests inestables | Usar eventos, latencias, versiones y timestamps ficticios deterministas. |
| El cambio puede romper el E2E actual del kanban | Actualizar el flujo E2E para las nuevas acciones y conservar una transición verificable. |

## What is **not** in this spec

- Supabase Database, Auth, Storage, migraciones o RLS.
- APIs HTTP, webhooks, workers, colas, cron jobs o despliegues reales.
- Claude, OpenAI u otro proveedor LLM real.
- HubSpot, Salesforce, Postgres remoto, Slack o email transaccional real.
- Consultas CRM, búsquedas documentales o lectura de URLs externas.
- Gestión multi-workspace, multiusuario o colaboración concurrente.
- Editor de nodos libre con drag and drop.
- Analítica, observabilidad o telemetría de producción.
- Internacionalización de rutas fuera de `/es/`.
- Cambios en las demos de cualificación, pedidos o backoffice fuera de ajustes de navegación/tests compartidos.
