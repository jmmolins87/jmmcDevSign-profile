# SPEC 05 — Reconstrucción fiel de la demo Agent Builder

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 03
> **Date:** 2026-11-14
> **Objective:** Sustituir la demo reducida de `/es/demos/agent-builder` por una superficie completa de configuración y runtime fiel a `resources/05_demo_agent_builder`, manteniendo todo mock y dejando contratos preparados para una futura integración de producción.

## Scope

**In:**

- Reconstruir la superficie visual de `resources/05_demo_agent_builder/screen.png` y `code.html`.
- Mantener la ruta `/es/demos/agent-builder` pública, sin exigir sesión ni rol.
- Implementar la barra de control, breadcrumb, estado del núcleo, reinicio de conversación y despliegue mock.
- Implementar la matriz de estados `idle`, `typing`, `error` y `deployed`.
- Implementar configuración de agente con identificador, temperatura, ventana contextual, personalidad, modelo, revisión y prompt de sistema.
- Implementar conectores mock activables y desactivables.
- Implementar fuentes de conocimiento mock de tipo `FILE` y `URL`, con alta y baja local.
- Implementar validación de configuración con errores visibles y accesibles.
- Implementar despliegue mock tras validación correcta, con versión y confirmación local.
- Implementar runtime conversacional con prompts rápidos, respuesta determinista, telemetría y traza operativa.
- Implementar reinicio de conversación sin perder la configuración.
- Persistir configuración, conectores, fuentes y estado mock en `localStorage` con una clave versionada.
- Usar contratos de dominio y adaptadores mock separados de la UI, preparados para sustituirlos por servicios reales.
- Mantener todos los datos y respuestas en fixtures locales, sin llamadas de red ni proveedores externos.
- Mantener la dirección visual brutalista editorial: tipografías, tokens, hairlines, geometría cuadrada, densidad y uso limitado del naranja.
- Adaptar la composición a 375px y 1440px, apilando configuración y runtime en móvil.
- Mantener navegación por teclado, foco visible, nombres accesibles, regiones vivas y `prefers-reduced-motion`.
- Añadir tests unitarios, de componentes y E2E para configuración, persistencia, runtime, estados, permisos y responsive.

**Out of scope (for future specs):**

- Conectar Supabase, una API propia o cualquier proveedor LLM real.
- Ejecutar llamadas HTTP, búsquedas documentales reales o consultas CRM reales.
- Subir archivos, leer URLs externas o procesar contenido remoto.
- Crear tablas, migraciones, políticas RLS o persistencia remota.
- Implementar permisos nuevos por acción.
- Ejecutar despliegues reales, workers, colas, cron jobs o telemetría de producción.
- Implementar OAuth, email transaccional o integraciones externas.
- Añadir colaboración multiusuario o edición concurrente.
- Añadir una bandeja de agentes, multi-workspace o gestión de varios agentes en esta fase.

## Data model

La implementación mantiene un repositorio mock persistente. Los contratos no dependen de React, `localStorage`, Supabase ni de un proveedor de modelos.

### Agent builder

```ts
type AgentRuntimeState = "idle" | "typing" | "error" | "deployed";

type AgentTemperature = "0.0" | "0.15" | "0.2" | "0.7";

type AgentSourceType = "FILE" | "URL";

type AgentConnector = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

type AgentKnowledgeSource = {
  id: string;
  type: AgentSourceType;
  label: string;
  reference: string;
};

type AgentConfig = {
  id: string;
  slug: string;
  name: string;
  model: string;
  temperature: AgentTemperature;
  contextWindow: string;
  personality: string;
  systemPrompt: string;
  revision: string;
  connectors: AgentConnector[];
  sources: AgentKnowledgeSource[];
  runtimeState: AgentRuntimeState;
  deployedVersion?: string;
  updatedAt: string;
};
```

### Runtime mock

```ts
type AgentMessage = {
  id: string;
  role: "operator" | "agent";
  content: string;
  at: string;
  latency?: string;
  tokenUsage?: number;
};

type AgentRuntimeSnapshot = {
  state: AgentRuntimeState;
  latency: string;
  tokenUsage: number;
  messages: AgentMessage[];
};
```

El runtime mock debe devolver fixtures deterministas y no debe usar reloj real, aleatoriedad ni red para generar resultados.

### Contratos

```ts
interface AgentBuilderRepository {
  get(id: string): Promise<AgentConfig | null>;
  update(id: string, input: Partial<AgentConfig>): Promise<AgentConfig>;
  reset(id: string): Promise<AgentConfig>;
}

interface AgentRuntimeService {
  run(input: { agentId: string; prompt: string }): Promise<AgentRuntimeSnapshot>;
  deploy(agentId: string): Promise<{ agent: AgentConfig; version: string }>;
}
```

Los componentes consumen estos contratos y no acceden directamente a fixtures, `localStorage` ni proveedores externos.

### Validación

La validación de despliegue exige `slug`, `name`, `model`, `temperature`, `contextWindow`, `personality` y `systemPrompt` no vacíos. Debe existir al menos un conector activo. Los errores se muestran junto al campo afectado y no se cambia a `deployed` si la configuración no es válida.

## Implementation plan

1. Crear los tipos, estados, fixtures, contratos y validador del dominio Agent Builder.
2. Implementar el repositorio mock persistente con snapshot versionado, recuperación segura y reset de conversación/configuración según el flujo definido.
3. Implementar el servicio de runtime mock con respuestas deterministas, telemetría y transición explícita entre estados.
4. Sustituir el panel actual por la composición completa de la referencia, reutilizando los tokens y primitivas UI existentes.
5. Implementar la barra superior, matriz de estados, tabs móviles y paneles de configuración/runtime.
6. Implementar los campos de configuración, presets de personalidad, conectores, fuentes, prompt de sistema y estado sincronizado.
7. Implementar validación accesible, despliegue mock, versión desplegada y mensajes de éxito/error.
8. Implementar conversación, prompts rápidos, envío, respuesta determinista, trazas, telemetría y reinicio.
9. Implementar persistencia `localStorage`, recuperación ante snapshot inválido y estados vacíos/error.
10. Verificar responsive, teclado, focus visible, `aria-live`, diálogos y `prefers-reduced-motion`.
11. Añadir tests unitarios y de componentes para dominio, repositorio, validación, runtime y controles.
12. Actualizar el flujo E2E de la demo y ejecutar lint, typecheck, tests, build y E2E.
13. Documentar la frontera futura de producción sin introducir integraciones remotas ni dependencias nuevas.

## Acceptance criteria

- [ ] `/es/demos/agent-builder` reproduce la composición principal de `screen.png` sin errores de runtime.
- [ ] La superficie incluye barra de control, estado del núcleo, reinicio, despliegue, matriz de estados, configuración, runtime y footer.
- [ ] La configuración permite editar identificador, temperatura, ventana contextual, personalidad, modelo, revisión y prompt.
- [ ] Los conectores se pueden activar y desactivar y muestran el número de elementos activos.
- [ ] Se pueden añadir y eliminar fuentes mock `FILE` y `URL` sin llamadas externas.
- [ ] La validación muestra errores accesibles y bloquea el despliegue cuando faltan datos o conectores activos.
- [ ] El despliegue mock valida, cambia a `deployed`, genera una versión local y muestra confirmación.
- [ ] La matriz permite seleccionar `idle`, `typing`, `error` y `deployed`.
- [ ] El usuario puede enviar prompts rápidos o escribir un prompt y recibe una respuesta determinista.
- [ ] La traza muestra estado, latencia, consumo y mensajes de operador/agente.
- [ ] Reiniciar la conversación elimina el hilo sin borrar la configuración.
- [ ] La configuración, conectores, fuentes y estado se recuperan tras recargar mediante `localStorage` versionado.
- [ ] Un snapshot inválido se descarta y restaura fixtures seguros sin romper la ruta.
- [ ] La UI conserva los tokens, tipografías, hairlines, geometría cuadrada y acento naranja de la dirección visual.
- [ ] La UI funciona a 375px y 1440px, con configuración/runtime apilados en móvil.
- [ ] Los controles tienen nombre accesible, foco visible, navegación por teclado y feedback en regiones vivas.
- [ ] Las animaciones respetan `prefers-reduced-motion`.
- [ ] La ruta es accesible para usuarios anónimos y autenticados sin exigir cuenta ni rol.
- [ ] Existen contratos independientes de la UI para repositorio, runtime y validación.
- [ ] No existen llamadas de red, proveedores reales, migraciones ni secretos.
- [ ] `pnpm lint` pasa.
- [ ] `pnpm typecheck` pasa.
- [ ] `pnpm test` pasa.
- [ ] `pnpm build` pasa.
- [ ] `pnpm test:e2e` pasa.

## Traceability

| Requirement | Task | Test | Verification |
| --- | --- | --- | --- |
| REQ-001–003 | TASK-003, TASK-004 | TEST-001 | VERIFY-PASS |
| REQ-004–006 | TASK-005, TASK-006 | TEST-002, TEST-003 | VERIFY-PASS |
| REQ-007–009 | TASK-007 | TEST-004 | VERIFY-PASS |
| REQ-010 | TASK-002 | TEST-005 | VERIFY-PASS |
| REQ-011–012 | TASK-008, TASK-009 | TEST-006, TEST-007 | VERIFY-PASS |
| REQ-013 | TASK-001, TASK-002, TASK-010 | TEST-008 | VERIFY-PASS |

## Decisions

- **Sí:** reconstrucción fiel de la referencia, no solo pulido de la demo actual.
- **Sí:** flujo mock completo para configuración, conectores, fuentes, validación, despliegue, runtime y conversación.
- **Sí:** contratos y adaptadores mock separados de la UI para permitir integración futura sin cambiar los componentes.
- **Sí:** mantener la demo pública para usuarios anónimos y autenticados, sin permisos nuevos por acción.
- **Sí:** usar fixtures deterministas y estados controlables; no depender de reloj, aleatoriedad ni red.
- **Sí:** persistir el workspace mock en `localStorage` versionado.
- **Sí:** español como idioma de interfaz y términos técnicos en inglés cuando formen parte del dominio.
- **No:** conectar proveedores reales, subir archivos, leer URLs o ejecutar despliegues reales.

## Risks

| Risk | Mitigation |
| --- | --- |
| La captura contiene más campos que el modelo actual | Ampliar el contrato de dominio y cubrir cada campo con tests. |
| `localStorage` puede estar corrupto o bloqueado | Validar snapshots, recuperar fixtures seguros y mantener fallback en memoria. |
| La demo puede confundirse con una integración real | Etiquetar estados como mock/demo y documentar la frontera de producción. |
| La composición densa puede romperse en móvil | Apilar paneles, probar 375px y mantener scroll técnico solo donde sea necesario. |
| El runtime puede generar tests inestables | Usar fixtures deterministas y no depender de timers reales ni red. |

## What is **not** in this spec

- Supabase Database, Auth, Storage o RLS.
- Proveedores LLM, CRM, búsqueda documental o URLs externas.
- Subida o procesamiento real de archivos.
- Despliegues reales, cron, colas, workers o telemetría de producción.
- Gestión multi-agente, multi-workspace o colaboración.
- Internacionalización fuera de `/es/`.

