# Design

## Context

La ruta actual usa un panel de kanban pequeño sobre `DemoPageShell`. La referencia `resources/06_demo_leads_workflow` requiere un workspace denso con canvas y registro lateral, mientras que el proyecto ya dispone de tokens editoriales, primitivas UI y un `Drawer` accesible. La ruta debe seguir siendo pública y toda la ejecución debe permanecer local y determinista.

## Goals / Non-Goals

**Goals:**

- Separar contratos de dominio, fixtures, adaptadores persistentes, runtime mock y componentes React.
- Mantener una única fuente de verdad para el snapshot local y recuperar fixtures seguros ante fallos.
- Reproducir la jerarquía visual de la referencia en escritorio y una composición canvas-first en móvil.
- Cubrir los flujos de interacción, errores y accesibilidad con pruebas deterministas.

**Non-Goals:**

- Integrar Supabase, APIs HTTP, AWS, HubSpot, Slack, email o LLM reales.
- Añadir drag and drop, posiciones arbitrarias, autenticación, multiusuario o persistencia remota.
- Añadir dependencias nuevas o cambiar otras demos fuera de los ajustes mínimos de navegación y E2E.

## Decisions

- **Puertos de dominio y adaptadores mock:** los tipos y contratos vivirán en un módulo independiente; fixtures, `localStorage` y runtime serán adaptadores intercambiables. Se elige esta separación para conservar una frontera futura de producción sin contaminar la UI.
- **Snapshot versionado completo:** el repositorio persistirá un único documento con versión, workflow, leads, eventos, preset, filtros y despliegue. Se elige frente a varias claves para que la validación y el fallback sean atómicos.
- **Tiempo y versiones deterministas:** latencias, timestamps relativos y versión de despliegue procederán de fixtures y contadores locales, nunca del reloj real ni de aleatoriedad.
- **Canvas CSS/SVG no editable libremente:** nodos con posiciones de layout conocidas y conexiones SVG ortogonales reproducirán la referencia y evitan introducir un editor de nodos fuera de alcance.
- **Drawer existente en móvil:** se reutiliza `app/components/ui/drawer.tsx` para foco, `Escape`, backdrop y retorno de foco, evitando otro patrón modal.
- **Cliente aislado en la página:** la página conserva metadata y composición de ruta; el panel interactivo será Client Component porque necesita estado local, efectos de almacenamiento y eventos de usuario.

## Risks / Trade-offs

- [Densidad visual alta] → se usan tokens existentes, overflow controlado y un canvas con posiciones deterministas; se verifica en 375px y 1440px.
- [Snapshot incompatible] → se valida una versión y la forma completa antes de hidratar; el fallback restaura fixtures y anuncia el resultado sin bloquear.
- [Fallo de accesibilidad en superficie compleja] → controles semánticos, regiones vivas, drawer existente y pruebas de teclado forman parte de cada grupo de tareas.
- [Regresión del E2E del kanban] → se sustituye el flujo E2E específico por acciones y estados de esta demo y se ejecutan los gates completos del proyecto.

## Migration Plan

1. Sustituir el panel de kanban por el workspace mock en la misma ruta.
2. No hay migración remota: el snapshot local usa una clave y versión propias; un snapshot anterior o inválido se descarta de forma segura.
3. Para rollback, restaurar el panel anterior y retirar los módulos de dominio de la demo; no se modifica ninguna base de datos ni proveedor externo.

