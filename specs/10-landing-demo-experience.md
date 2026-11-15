# SPEC 10 — Mejora de landing, localización y automatización de demos

> **Status:** Approved
> **Depends on:** SPEC 01, SPEC 02, SPEC 03, SPEC 05, SPEC 06, SPEC 07, SPEC 08, SPEC 09
> **Date:** 2026-11-15
> **OpenSpec change:** `10-landing-demo-experience`
> **Objective:** Corregir la experiencia de la landing y convertir las cinco demos en recorridos mock automatizados, visuales, accesibles y reproducibles en español e inglés.

## Scope

**In:**

- Alinear el header con el contenedor horizontal del contenido en 375px y 1440px.
- Sustituir los controles `D/L` por iconos de tema oscuro, claro y sistema.
- Hacer que el modo sistema reaccione a cambios de `prefers-color-scheme`.
- Mantener funcional el CTA `[ Acceder ]` como entrada a la modal de membresía.
- Añadir `/en` para landing, demos y autenticación, manteniendo rutas equivalentes a `/es`.
- Aumentar el tramo sticky de las cinco demos en la landing.
- Añadir reproducción mock determinista con inicio, pausa, reanudación, reinicio y progreso.
- Corregir el solapamiento de nodos en Leads Workflow.
- Hacer que `AUTO-ALIGN` y `RESET GRID` generen posiciones válidas y sin colisiones.
- Animar Leads Workflow mediante recorrido secuencial por nodos y aristas.
- Simular entradas y transiciones de pedidos en Orders Realtime.
- Corregir los skeletons persistentes de Lead Qualification.
- Conectar `[ VER ]` de Business Backoffice con el drawer de expediente correcto.
- Mejorar estados, feedback, métricas, transiciones, vacíos, errores y finalización de las cinco demos.
- Mantener foco visible, teclado, `aria-live`, reduced motion y ausencia de overflow horizontal.
- Mantener mocks locales, persistencia segura y contratos de dominio independientes por demo.

**Out of scope:**

- Supabase, APIs HTTP, WebSocket, SSE, realtime externo o sincronización multiusuario.
- Pagos, correo real, IA remota, proveedores externos o despliegues.
- Área privada nueva para membresía.
- Drag-and-drop libre de nodos en Leads Workflow.
- Rediseño completo de la dirección visual editorial existente.
- Compartir fixtures o snapshots de negocio entre demos.

## Locale model

La aplicación debe soportar los locales `es` y `en`. Cada superficie pública tendrá una ruta equivalente:

```text
/es/                         <-> /en/
/es/login                    <-> /en/login
/es/demos/agent-builder      <-> /en/demos/agent-builder
/es/demos/leads-workflow     <-> /en/demos/leads-workflow
/es/demos/lead-qualification <-> /en/demos/lead-qualification
/es/demos/orders-realtime    <-> /en/demos/orders-realtime
/es/demos/business-backoffice <-> /en/demos/business-backoffice
```

Los identificadores técnicos, nombres de productos, valores de fixtures y nombres de proveedores pueden permanecer sin traducir. La navegación, acciones, estados, errores y feedback deben estar disponibles en ambos idiomas.

## Theme behavior

```ts
type ThemePreference = "dark" | "light" | "system";
```

El selector debe mostrar tres controles icónicos con nombre accesible, estado seleccionado y tooltip. `system` debe leer `prefers-color-scheme` y reaccionar a cambios posteriores. La preferencia explícita se conserva en `localStorage`; si el almacenamiento no está disponible, la sesión continúa en memoria.

## Demo playback contract

```ts
type PlaybackStatus = "idle" | "running" | "paused" | "completed";

type PlaybackStep = {
  id: string;
  label: string;
  durationMs: number;
};

type PlaybackState = {
  status: PlaybackStatus;
  currentStep: number;
  progress: number;
};

interface DemoPlaybackController {
  start(): Promise<PlaybackState>;
  pause(): Promise<PlaybackState>;
  resume(): Promise<PlaybackState>;
  reset(): Promise<PlaybackState>;
  getState(): Promise<PlaybackState>;
}
```

El controlador debe ser determinista, idempotente en pausa/reanudación y compatible con relojes controlados en tests. Cada demo conserva sus propios tipos y repositorios de dominio.

## Leads Workflow behavior

El canvas debe validar las posiciones antes de renderizar o persistirlas. El layout inicial y `AUTO-ALIGN` deben garantizar una separación mínima entre cajas y mantener las aristas conectadas.

La ejecución de `SIMULAR` o `TEST` debe recorrer los nodos conectados en orden:

```text
WEBHOOK -> AGENTE_IA -> CRM & POSTGRES -> EMAIL_NURTURE / SLACK_NOTIFY
```

En cada paso:

- el nodo activo cambia visualmente;
- la arista correspondiente muestra el avance;
- se añade un evento de auditoría;
- el siguiente paso no comienza hasta completar el anterior;
- un error detiene el recorrido y queda visible en la traza.

Con reduced motion activo se mantienen los estados y el orden, reduciendo las transiciones a cambios inmediatos o breves.

## Orders Realtime behavior

El escenario automático debe introducir pedidos de forma determinista y moverlos entre las columnas:

```text
NUEVO -> EN PLANCHA -> LISTO -> ENTREGADO
```

La pausa bloquea nuevas entradas y transiciones automáticas. Los controles manuales deben conservar idempotencia, eventos y persistencia local ya existentes.

## Acceptance criteria

- [ ] El header está alineado con el contenido a 375px y 1440px.
- [ ] El selector muestra iconos de oscuro, claro y sistema.
- [ ] El modo sistema reacciona a cambios del tema del sistema operativo.
- [ ] `[ Acceder ]` abre la modal desde header, menú y móvil.
- [ ] `/en` funciona para landing, demos y autenticación.
- [ ] El cambio de idioma conserva la superficie equivalente.
- [ ] Cada demo permanece sticky durante un tramo amplio y estable.
- [ ] Las cinco demos tienen reproducción mock con inicio, pausa, reanudación, reinicio y progreso.
- [ ] Agent Builder conserva sus operaciones y muestra la reproducción automatizada.
- [ ] Leads Workflow no muestra nodos solapados inicialmente.
- [ ] `AUTO-ALIGN` y `RESET GRID` no producen solapamientos.
- [ ] Las aristas siguen conectadas tras zoom, alineación y restauración.
- [ ] Leads Workflow anima el recorrido secuencial de nodos y aristas.
- [ ] La traza de Leads Workflow conserva el orden de ejecución.
- [ ] Un error del workflow detiene la reproducción y muestra feedback accesible.
- [ ] Orders Realtime introduce pedidos automáticamente.
- [ ] Los pedidos avanzan por `NUEVO`, `EN PLANCHA`, `LISTO` y `ENTREGADO`.
- [ ] Pausar Orders Realtime bloquea entradas y transiciones automáticas.
- [ ] Los skeletons de Lead Qualification desaparecen al terminar la carga.
- [ ] Cambiar o reiniciar el escenario de Lead Qualification no deja skeletons permanentes.
- [ ] `[ VER ]` de Business Backoffice abre el drawer correcto.
- [ ] El drawer restaura foco y conserva filtros y página al cerrarse.
- [ ] Todas las demos muestran estados, progreso, feedback, vacíos y errores de forma visible.
- [ ] Las demos funcionan con teclado y reduced motion.
- [ ] No existe overflow horizontal involuntario a 375px ni 1440px.
- [ ] No se añaden dependencias ni integraciones externas.
- [ ] `pnpm lint` pasa.
- [ ] `pnpm typecheck` pasa.
- [ ] `pnpm test` pasa.
- [ ] `pnpm build` pasa.
- [ ] `pnpm test:e2e` pasa.
- [ ] `openspec validate 10-landing-demo-experience --strict` pasa.
- [ ] La trazabilidad `REQ → TASK → TEST → VERIFY-PASS` está completa.

## Implementation plan

1. Crear la frontera de locale compartida y los diccionarios tipados ES/EN, preservando `/es`.
2. Corregir el contenedor del header y conectar el CTA de membresía con la modal existente.
3. Implementar `dark`, `light` y `system`, incluyendo escucha reactiva del sistema operativo.
4. Ajustar los tramos sticky y añadir tests de umbrales y reduced motion.
5. Crear el contrato común de reproducción mock y adaptarlo a cada demo.
6. Implementar layout collision-free y ejecución secuencial animada en Leads Workflow.
7. Implementar playback de pedidos, ciclo de skeletons y drawer de Business Backoffice.
8. Añadir feedback visual, accesibilidad y responsive a las cinco demos.
9. Ejecutar tests por capability, E2E y quality gates completos.
10. Ejecutar Verify y Spec Verifier antes de solicitar aprobación final y archivo.

## Traceability

| Requirement | Task | Test | Verification |
|---|---|---|---|
| REQ-001–REQ-005 | TASK-001–TASK-007 | TEST-001–TEST-007 | VERIFY-PASS |
| REQ-006 | TASK-006–TASK-010 | TEST-008–TEST-010 | VERIFY-PASS |
| REQ-007–REQ-008 | TASK-008–TASK-010 | TEST-012–TEST-016 | VERIFY-PASS |
| REQ-009 | TASK-012 | TEST-018 | VERIFY-PASS |
| REQ-010–REQ-011 | TASK-011, TASK-013 | TEST-017, TEST-019 | VERIFY-PASS |
| REQ-012–REQ-014 | TASK-014–TASK-016 | TEST-020–TEST-022 | VERIFY-PASS |
| REQ-015 | TASK-016 | TEST-023–TEST-024 | VERIFY-PASS |

## Decisions

- **Sí:** una única spec coordinada con tres capabilities OpenSpec.
- **Sí:** cubrir las cinco demos actuales.
- **Sí:** mantener todo mock local y determinista.
- **Sí:** iniciar la automatización mediante acción explícita y permitir pausa, reanudación y reinicio.
- **Sí:** usar segmento de locale compartido en lugar de duplicar `app/es` en `app/en`.
- **Sí:** mantener `[ Acceder ]` como CTA y hacer que abra la modal de membresía.
- **Sí:** usar el drawer de expediente existente para `[ VER ]`.
- **Sí:** corregir Leads Workflow con layout sin colisiones y recorrido secuencial animado.
- **Pendiente:** aprobación formal de esta spec antes de pasar a Build Mode.
