# SPEC 04 — Demo Agente de leads interactiva con mocks

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02, SPEC 03
> **Date:** 2026-09-25
> **Objective:** Implementar la demo del Agente de leads como ruta `/demos/leads` interactiva con mocks.

## Por qué existe esta spec

La landing enlaza un sandbox del Agente de leads que no existe. La referencia `references/02_demo_agente_de_leads/` trae el diseño (kanban 4 columnas, KPIs, panel IA, feed en vivo) en `code.html` + `screen.png`. Hace falta convertirlo en una ruta Next.js interactiva que demuestre el producto con datos ficticios, sin backend.

## Alcance

**In:**

- Ruta `/demos/leads` con cabecera de demo (volver al portfolio, badge `DEMO · DATOS FICTICIOS`, tabs Pipeline/Actividad/Ajustes).
- 4 KPIs superiores con datos mock.
- Kanban de 4 columnas (Nuevo, Cualificado, Seguimiento, Reunión) con click en tarjeta que selecciona el lead y actualiza el panel IA.
- Panel IA derecho con detalle de cualificación, score, próximo paso y secuencia del agente del lead seleccionado.
- Feed de actividad con simulación en vivo por timer, desactivada con `prefers-reduced-motion`.
- Vista Actividad (feed expandido) y vista Ajustes (toggles con estado local mock que se reflejan en el badge de estado, sin persistencia).
- Mocks en `lib/data/` (tipos `Lead`, `Kpi`, `FeedEvent`, `AgentStep`) coherentes con SPEC 03, todo `[placeholder]`.
- Cablear el botón "Explorar sandbox" del Agente de leads en la landing hacia `/demos/leads`.
- Animaciones de entrada reutilizando `ScrollAnimations` y sus hooks `data-anim`.

**Fuera de alcance (specs futuras):**

- Backend real o conexión Supabase para esta demo (usa mocks; el corte es otra spec).
- Controles secundarios funcionales: filtrar por origen, previsualizar, pausar, "ver registro completo". Quedan inertes.
- Arrastrar tarjetas entre columnas (drag & drop).
- Demos 03 y 04, resto de pantallas.

## Modelo de datos

Mocks en `lib/data/` (fichero `leads.ts`), sin persistencia:

```ts
export type LeadColumn = "nuevo" | "cualificado" | "seguimiento" | "reunion";

export type Lead = {
  id: string;
  name: string;
  role: string;
  company: string;
  channel: string;
  time: string;
  score: number;
  column: LeadColumn;
  priority: "alta" | "media" | "baja";
  email: string;
  phone: string;
  signals: { label: string; body: string }[];
  nextStep: string;
  steps: AgentStep[];
};

export type Kpi = { label: string; value: string; detail: string; tone: "teal" | "ochre" | "accent" };
export type FeedEvent = { time: string; title: string; meta: string };
export type AgentStep = { label: string; state: "done" | "active" | "todo"; meta: string };
```

Convención: todo dato ficticio lleva `// [placeholder]`. La UI muestra el badge `DEMO · DATOS FICTICIOS` de la referencia.

## Plan de implementación

1. **Datos.** Crear tipos y mocks en `lib/data/leads.ts` (8 leads, 4 KPIs, 4+ eventos, secuencia del agente) y cablear el sandbox de la landing a `/demos/leads`. *Verificar:* `npx tsc --noEmit` pasa y `npm run build` termina sin errores.
2. **Ruta y cabecera.** Crear `app/demos/leads/page.tsx` con cabecera de demo (volver, badge, tabs con estado) y los 4 KPIs. *Verificar:* `/demos/leads` renderiza la cabecera y los valores 48, 32, 78.4% y 12.
3. **Kanban + panel IA.** Columnas con contadores y tarjetas clicables; el click actualiza el panel derecho (detalle, score, próximo paso, secuencia). *Verificar:* clicar cada tarjeta cambia el nombre del panel sin errores de consola.
4. **Feed y vistas.** Feed con timer de simulación (solo sin `reduced-motion`) + vistas Actividad y Ajustes con toggles locales. *Verificar:* con movimiento activado el feed añade un evento; con `reduce` no hay timer.
5. **QA visual.** Capturas Playwright a 1440px y 390px en `.playwright-mcp/04-demo-agente-leads/after/`, comparar con `screen.png` y ejecutar `npm run lint` y `npx tsc --noEmit`. *Verificar:* cero desviaciones de jerarquía y cero errores.

## Criterios de aceptación

- [x] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [x] `/demos/leads` muestra cabecera, 4 KPIs, kanban de 4 columnas con sus contadores, panel IA y feed.
- [x] Clicar una tarjeta actualiza nombre, score y secuencia del panel IA.
- [x] Los 3 tabs conmutan de vista sin recargar.
- [x] El feed añade eventos con el timer salvo con `prefers-reduced-motion: reduce`.
- [x] "Explorar sandbox" del Agente de leads navega a `/demos/leads` y "Volver al portfolio" a `/`.
- [x] Las capturas a 1440px y 390px no muestran desviaciones respecto a `screen.png`.
- [x] Todo dato ficticio está marcado con `[placeholder]` y no hay llamadas de red a backend.

## Decisiones

- **Sí:** selección por click con estado local. **No:** drag & drop entre columnas, fuera de esta demo.
- **Sí:** feed simulado con timer. **No:** WebSockets ni backend real.
- **Sí:** Ajustes con toggles locales que se reflejan en el badge. **No:** persistencia ni efecto real.
- **Sí:** filtros, previsualizar, pausar y ver-registro inertes. **No:** implementarlos a medias.
- **Sí:** mocks en `lib/data/` coherentes con SPEC 03. **No:** nuevo sistema de datos para demos.
- **Sí:** reutilizar `ScrollAnimations` y primitivas `ui/`. **No:** sistema de animación propio.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El timer choca con la hidratación SSR | Componente cliente con `useEffect`; el HTML inicial trae el estado mock |
| El timer molesta con `reduced-motion` | No se crea el intervalo; feed estático |
| La demo crece y pide drag & drop real | Explícitamente fuera; spec futura si se pide |

## Lo que **no** está en esta spec

- Backend real, Supabase para la demo y drag & drop.
- Controles secundarios funcionales y persistencia de ajustes.
- Demos 03 y 04, resto de pantallas y deploy.
