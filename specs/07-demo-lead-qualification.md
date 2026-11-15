# SPEC 07 — Reconstrucción fiel de la demo Lead Qualification

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-11-15
> **Objective:** Sustituir la demo reducida de `/es/demos/lead-qualification` por una superficie de cualificación de leads fiel a `resources/07_demo_lead_qualification`, manteniendo todos los datos y flujos en mocks y dejando contratos preparados para una integración futura de producción.

## Scope

**In:**

- Reconstruir la superficie visual de `resources/07_demo_lead_qualification/screen.png` y `code.html`.
- Mantener la ruta `/es/demos/lead-qualification` pública, sin exigir sesión ni rol.
- Adoptar el shell de la referencia: header fijo, command bar, simulador de estados, rail de KPIs, bandeja de entrada, expediente central, secuencia lateral y footer operativo.
- Mantener la dirección visual brutalista editorial: tipografías, tokens, hairlines, geometría cuadrada, densidad y uso limitado del naranja.
- Implementar los cinco leads de la referencia con selección, score, tier, contacto, organización, presupuesto, origen, mensaje original, evaluación, recomendación, responsable y secuencia.
- Implementar los filtros `[ TODOS ]`, `[ CALIENTES ]`, `[ TEMPLADOS ]` y `[ FRÍOS ]`, además de búsqueda por nombre, empresa o puntuación.
- Implementar los estados `EN VIVO (ESTÁNDAR)`, `CALIFICANDO EN DIRECTO`, `BANDEJA VACÍA` y `ESQUELETOS (SKELETONS)`.
- Implementar las acciones `APROBAR ACCIÓN`, `REASIGNAR`, `EDITAR RESPUESTA`, `RECARGAR BANDEJA SIMULADA`, `INYECTAR LEAD TEST` y pausar/reanudar la secuencia.
- Implementar diálogos mock para reasignación y edición de respuesta, con guardar, cancelar y validación accesible.
- Implementar un runtime mock determinista para la calificación en directo y la inyección de un lead de prueba.
- Persistir leads, selección, filtros, asignaciones, respuestas, secuencias, estado del simulador y eventos en `localStorage` mediante un snapshot versionado.
- Recuperar fixtures seguros cuando el snapshot sea inválido, incompatible, ilegible o el almacenamiento no esté disponible.
- Mantener contratos de dominio y adaptadores mock separados de React, `localStorage` y proveedores externos.
- Adaptar la composición a 375px y 1440px; en móvil usar la navegación por pestañas `BANDEJA`, `DETALLE` y `SEGUIMIENTO` de la referencia.
- Mantener nombres accesibles, foco visible, navegación por teclado, regiones vivas y respeto de `prefers-reduced-motion`.
- Añadir tests unitarios, de componentes y E2E para dominio, estados, filtros, acciones, persistencia, accesibilidad y responsive.

**Out of scope (for future specs):**

- Conectar Supabase, una API propia, HubSpot, GitHub, WhatsApp, Calendly, WABA, Slack o cualquier proveedor externo.
- Ejecutar llamadas HTTP, webhooks reales, búsquedas CRM reales o inferencia LLM real.
- Enviar mensajes, audios, emails, WhatsApp o invitaciones de calendario reales.
- Crear tablas, migraciones, políticas RLS o persistencia remota.
- Implementar autenticación o permisos nuevos por acción.
- Ejecutar workers, colas, cron jobs, telemetría de producción o despliegues reales.
- Compartir estado o fixtures con `/es/demos/leads-workflow`; la integración entre demos requiere una spec independiente.
- Añadir colaboración multiusuario, edición concurrente, multi-workspace o sincronización remota.
- Añadir nuevas dependencias sin autorización explícita.

## Data model

La implementación mantiene un workspace mock persistente. Los contratos no dependen de React, `localStorage`, Supabase ni de proveedores externos.

### Qualification workspace

```ts
type QualificationSimulationState =
  | "standard"
  | "qualifying"
  | "empty"
  | "skeleton";

type QualificationTier = "A" | "B" | "discard";

type QualificationLead = {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  origin: "github" | "web-form" | "webhook-api";
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
  sequenceState: "running" | "paused" | "completed";
  lastEvent: string;
  relativeTime: string;
};

type QualificationAuditEvent = {
  id: string;
  leadId?: string;
  type: "qualification" | "dispatch" | "assignment" | "response" | "sequence" | "injection";
  label: string;
  status: "success" | "warning" | "error";
  latency: string;
  at: string;
};

type QualificationWorkspace = {
  version: 1;
  leads: QualificationLead[];
  selectedLeadId: string;
  simulationState: QualificationSimulationState;
  search: string;
  tierFilter: "all" | QualificationTier;
  events: QualificationAuditEvent[];
};
```

Los fixtures deben conservar los cinco expedientes visibles en la referencia: Elena Rostova, Marcus Vance, Carlos Mendonça, Laura Chen y David Silva. Los scores, tiers, nombres, proveedores y metadatos técnicos son datos mock deterministas. El runtime no debe usar reloj real, aleatoriedad, red ni respuestas generadas por un proveedor externo.

### Contracts

```ts
interface QualificationRepository {
  getWorkspace(): Promise<QualificationWorkspace>;
  updateLead(id: string, input: Partial<QualificationLead>): Promise<QualificationLead>;
  appendEvent(event: QualificationAuditEvent): Promise<QualificationAuditEvent>;
  resetWorkspace(): Promise<QualificationWorkspace>;
}

interface QualificationRuntimeService {
  selectLead(input: { leadId: string }): Promise<QualificationWorkspace>;
  setSimulationState(input: { state: QualificationSimulationState }): Promise<QualificationWorkspace>;
  approveAction(input: { leadId: string }): Promise<{ lead: QualificationLead; event: QualificationAuditEvent }>;
  reassignLead(input: { leadId: string; owner: string }): Promise<QualificationLead>;
  updateResponse(input: { leadId: string; responseDraft: string }): Promise<QualificationLead>;
  toggleSequence(input: { leadId: string }): Promise<QualificationLead>;
  injectTestLead(): Promise<{ workspace: QualificationWorkspace; lead: QualificationLead }>;
}
```

Los componentes consumen estos contratos y no acceden directamente a fixtures, `localStorage` ni proveedores externos.

### Validation

La aprobación exige un lead seleccionado y una respuesta mock no vacía. La reasignación exige un responsable perteneciente al catálogo local. La edición de respuesta rechaza contenido vacío o compuesto solo por espacios. Las operaciones duplicadas no deben crear eventos de despacho repetidos.

El snapshot se valida antes de restaurarse: versión, campos requeridos, identificadores únicos, tier, score entre 0 y 100 y estado de secuencia. Si falla, se restauran fixtures seguros y se muestra feedback no bloqueante.

## Implementation plan

1. Crear tipos, estados, fixtures, contratos y validadores del dominio Lead Qualification.
2. Implementar el repositorio mock persistente con snapshot versionado, recuperación segura, fallback en memoria y reset.
3. Implementar el runtime mock para selección, filtros, presets, calificación, aprobación, reasignación, edición, secuencia e inyección.
4. Sustituir el panel actual por la composición completa de la referencia, reutilizando tokens y primitivas UI existentes.
5. Implementar command bar, simulador de estados, rail de KPIs, bandeja, expediente, secuencia, telemetría y footer operativo.
6. Implementar búsqueda, filtros por tier, selección de lead y actualización reactiva del expediente central.
7. Implementar los estados estándar, calificando, bandeja vacía y skeletons con feedback `aria-live`.
8. Implementar aprobación, reasignación, edición de respuesta y pausa/reanudación mediante diálogos y controles accesibles.
9. Implementar recarga de bandeja e inyección de lead test con transición determinista y protección contra duplicados.
10. Implementar pestañas móviles, scroll, foco, cierre con `Escape` y respeto de `prefers-reduced-motion`.
11. Añadir tests unitarios y de componentes para dominio, repositorio, runtime, filtros, acciones, validación y recuperación.
12. Actualizar el flujo E2E de la demo y verificar 375px y 1440px en Chromium y Firefox.
13. Ejecutar lint, typecheck, tests, build, E2E y validación estricta de OpenSpec.
14. Documentar la frontera futura de producción sin introducir integraciones remotas ni dependencias nuevas.

## Acceptance criteria

- [x] `/es/demos/lead-qualification` reproduce la composición principal de `screen.png` sin errores de runtime.
- [x] La superficie incluye header fijo, command bar, simulador, cuatro KPIs, bandeja, expediente central, secuencia y footer.
- [x] La apariencia conserva tipografías, tokens, hairlines, geometría cuadrada, densidad y acento naranja de la referencia.
- [x] El registro inicial contiene los cinco leads de la referencia con nombre, rol, empresa, score, tier, origen y tiempo relativo.
- [x] Seleccionar un lead actualiza contacto, teléfono, organización, presupuesto, mensaje, evaluación, recomendación y secuencia.
- [x] La búsqueda filtra por nombre, empresa o puntuación y muestra un estado vacío accesible cuando no hay coincidencias.
- [x] Los filtros `[ TODOS ]`, `[ CALIENTES ]`, `[ TEMPLADOS ]` y `[ FRÍOS ]` cambian el registro sin llamadas externas.
- [x] `EN VIVO (ESTÁNDAR)`, `CALIFICANDO EN DIRECTO`, `BANDEJA VACÍA` y `ESQUELETOS (SKELETONS)` producen estados reproducibles.
- [x] `APROBAR ACCIÓN` actualiza el lead, registra el despacho mock y evita duplicados.
- [x] `REASIGNAR` permite guardar o cancelar un responsable del catálogo mock.
- [x] `EDITAR RESPUESTA` permite guardar o cancelar un borrador no vacío y muestra errores accesibles.
- [x] La secuencia puede pausarse y reanudarse para el lead seleccionado sin afectar a los demás.
- [x] `RECARGAR BANDEJA SIMULADA` recupera el estado estándar sin borrar los datos persistidos.
- [x] `INYECTAR LEAD TEST` muestra el estado de calificación y añade a Victor Kline con score 94 sin duplicarlo.
- [x] Leads, selección, filtros, asignaciones, respuestas, secuencias, estado y eventos se recuperan tras recargar mediante `localStorage` versionado.
- [x] Un snapshot corrupto, incompatible o ilegible restaura fixtures seguros y muestra feedback no bloqueante.
- [x] La ruta funciona sin sesión ni rol y no ejecuta llamadas de red ni proveedores reales.
- [x] Existen contratos independientes de la UI para repositorio y runtime.
- [x] La UI funciona a 375px y 1440px sin pérdida de controles principales ni desbordamiento horizontal de página.
- [x] En móvil funcionan las pestañas `BANDEJA`, `DETALLE` y `SEGUIMIENTO`; seleccionar un lead abre su detalle.
- [x] Los controles tienen nombre accesible, foco visible, navegación por teclado y feedback en regiones vivas.
- [x] Los diálogos validan campos, conservan foco, se pueden cancelar y se cierran con `Escape`.
- [x] Las animaciones respetan `prefers-reduced-motion`.
- [x] `pnpm lint` pasa.
- [x] `pnpm typecheck` pasa.
- [x] `pnpm test` pasa.
- [x] `pnpm build` pasa.
- [x] `pnpm test:e2e` pasa en móvil y escritorio.

## Traceability

| Requirement | Task | Test | Verification |
| --- | --- | --- | --- |
| REQ-001 | TASK-3.2, TASK-5.3 | TEST-E2E-LEAD, TEST-E2E-REGRESSION | VERIFY-PASS |
| REQ-002 | TASK-1.1, TASK-3.2 | TEST-UNIT-DOMAIN, TEST-COMPONENT | VERIFY-PASS |
| REQ-003 | TASK-3.3 | TEST-UNIT-RUNTIME, TEST-COMPONENT, TEST-E2E-LEAD | VERIFY-PASS |
| REQ-004 | TASK-2.1, TASK-4.1 | TEST-UNIT-RUNTIME, TEST-E2E-LEAD | VERIFY-PASS |
| REQ-005 | TASK-2.2, TASK-4.2 | TEST-UNIT-RUNTIME, TEST-COMPONENT, TEST-E2E-LEAD | VERIFY-PASS |
| REQ-006 | TASK-2.1, TASK-4.3 | TEST-UNIT-RUNTIME, TEST-E2E-LEAD | VERIFY-PASS |
| REQ-007 | TASK-1.2, TASK-4.3, TASK-5.3 | TEST-UNIT-REPOSITORY, TEST-E2E-LEAD | VERIFY-PASS |
| REQ-008 | TASK-1.1, TASK-2.1, TASK-5.4 | TEST-UNIT-DOMAIN, TEST-UNIT-RUNTIME | VERIFY-PASS |
| REQ-009 | TASK-4.2, TASK-5.1 | TEST-COMPONENT, TEST-E2E-LEAD | VERIFY-PASS |
| REQ-010 | TASK-3.1, TASK-3.2 | TEST-E2E-LEAD | VERIFY-PASS |

The requirement identifiers above map to the ten added OpenSpec requirements in the same order: public surface, deterministic workspace, search/filter/selection, simulator states, lead actions, sequence/injection, local persistence, decoupled contracts, responsive/accessibility, and visual direction.

### Verification evidence

| Test ID | Evidence |
| --- | --- |
| TEST-UNIT-DOMAIN | `tests/unit/qualification-domain.test.ts` |
| TEST-UNIT-REPOSITORY | `tests/unit/qualification-repository.test.ts` |
| TEST-UNIT-RUNTIME | `tests/unit/qualification-runtime.test.ts` |
| TEST-COMPONENT | `tests/components/qualification-panel.test.tsx` |
| TEST-E2E-LEAD | `pnpm exec playwright test e2e/lead-qualification.spec.ts` — 12/12 en Chromium y Firefox, escritorio y móvil |
| TEST-E2E-REGRESSION | `pnpm test:e2e` — 120/120 |
| TEST-QUALITY-GATES | `pnpm lint`, `pnpm typecheck`, `pnpm test` — 44 archivos / 166 tests, `pnpm build`, `openspec validate 07-demo-lead-qualification --strict` |

**Independent verification:** 2026-11-15 — change `07-demo-lead-qualification` — dictamen `APPROVED`; 28/28 criterios PASS.

## Decisions

- **Sí:** reconstrucción fiel de la referencia, no solo pulido de la tabla actual.
- **Sí:** demo completa con filtros, selección, estados, aprobación, reasignación, edición, secuencia e inyección mock.
- **Sí:** persistir el workspace mock en `localStorage` versionado.
- **Sí:** mantener la demo independiente de Leads Workflow; no compartir estado en esta spec.
- **Sí:** contratos y adaptadores mock separados de la UI para permitir integración futura sin cambiar los componentes.
- **Sí:** usar fixtures y transiciones deterministas; no depender de reloj, aleatoriedad ni red.
- **Sí:** mantener la demo pública para usuarios anónimos y autenticados, sin permisos nuevos por acción.
- **Sí:** español como idioma de interfaz y términos técnicos en inglés cuando formen parte del dominio.
- **No:** conectar proveedores reales, enviar comunicaciones reales o persistir datos remotamente.

## Risks

| Risk | Mitigation |
| --- | --- |
| La captura es más densa que la superficie actual | Implementar primero la composición estructural y verificarla con capturas a 375px y 1440px. |
| Los estados mock pueden confundirse con integraciones activas | Etiquetar proveedores, latencias y envíos como metadata/mock y documentar la frontera de producción. |
| `localStorage` puede estar corrupto, bloqueado o lleno | Validar snapshots, recuperar fixtures seguros y mantener fallback en memoria con aviso. |
| Los diálogos y la navegación móvil pueden perder foco | Usar primitivas accesibles existentes y cubrir teclado, `Escape`, focus visible y `aria-live` en E2E. |
| Las operaciones repetidas pueden duplicar eventos | Hacer el runtime idempotente por lead y acción, con tests de doble activación. |
| La integración futura puede quedar acoplada a fixtures | Mantener contratos asíncronos, tipos de dominio y adaptadores separados de React y almacenamiento. |

## What is **not** in this spec

- Supabase Database, Auth, Storage o RLS.
- Proveedores LLM, CRM, WhatsApp, WABA, Calendly, Slack, GitHub o APIs externas.
- Envío real de mensajes, audios, emails o invitaciones.
- Despliegues reales, cron, colas, workers o telemetría de producción.
- Gestión multiusuario, multi-workspace o colaboración.
- Integración de datos con `/es/demos/leads-workflow`.
- Internacionalización fuera de `/es/`.
