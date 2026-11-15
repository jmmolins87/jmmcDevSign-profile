# Design

## Context

La demo actual de `/es/demos/lead-qualification` es reducida y el repositorio ya contiene tokens y primitivas UI reutilizables. La referencia exige una superficie densa y pública, pero los datos deben seguir siendo mock, deterministas y aislados de proveedores externos.

## Goals / Non-Goals

**Goals:**

- Separar el dominio de cualificación, el repositorio persistente y el runtime mock de la composición React.
- Reproducir la jerarquía visual de la referencia con una composición adaptable a escritorio y móvil.
- Hacer idempotentes las acciones que generan eventos y robusta la restauración desde `localStorage`.
- Cubrir comportamiento, accesibilidad, responsive y estados mediante tests reales del proyecto.

**Non-Goals:**

- Conectar Supabase, APIs propias, CRM, LLM, WhatsApp, GitHub, Calendly, Slack o cualquier proveedor externo.
- Añadir autenticación, permisos, persistencia remota, workers, colas, telemetría de producción o nuevas dependencias.
- Compartir estado o fixtures con `/es/demos/leads-workflow`.

## Decisions

1. **Capas de dominio y adaptadores.** Los tipos, fixtures, validadores, contratos y transiciones viven fuera de React. Un adaptador de `localStorage` implementa el repositorio; un fallback en memoria conserva la demo cuando el almacenamiento no está disponible.
2. **Snapshot versionado.** El snapshot incluye `version: 1` y se valida antes de restaurar: campos requeridos, ids únicos, score entre 0 y 100, tiers permitidos y estados de secuencia válidos. Ante cualquier fallo se usan fixtures seguros.
3. **Runtime determinista.** Las transiciones usan datos constantes, sin `Date`, `Math.random`, red ni respuestas generadas. La inyección identifica a Victor Kline por id y es idempotente.
4. **Estado de UI explícito.** La pantalla mantiene simulador, búsqueda, filtros, lead seleccionado y pestaña móvil como estado derivado del workspace y muestra feedback mediante una región `aria-live`.
5. **Composición por regiones.** El shell se divide en header/command bar, simulador, KPI rail, bandeja, expediente, seguimiento y footer. En móvil esas regiones se exponen mediante las pestañas requeridas sin ocultar la selección ni el foco.
6. **Diálogos accesibles.** Reasignación y edición de respuesta reutilizan primitivas existentes si están disponibles; cada diálogo valida localmente, conserva foco, acepta cancelar y `Escape` y no persiste datos inválidos.
7. **Movimiento condicionado.** Las transiciones visuales usan CSS o la solución existente del repositorio y se desactivan o suavizan bajo `prefers-reduced-motion`.

## Risks / Trade-offs

- [Densidad visual superior a la demo actual] → Implementar primero la estructura y verificar capturas a 375px y 1440px.
- [Los estados mock pueden parecer integraciones activas] → Etiquetar proveedores, latencias y despachos como metadata/mock y mantener la frontera documentada.
- [`localStorage` corrupto, bloqueado o lleno] → Validar antes de restaurar, usar fixtures seguros, fallback en memoria y feedback no bloqueante.
- [Pérdida de foco en diálogos o navegación móvil] → Usar primitivas accesibles, gestionar `Escape` y cubrir teclado en tests.
- [Eventos duplicados por activaciones repetidas] → Hacer idempotentes despacho e inyección por lead y acción.
- [Acoplamiento accidental a fixtures] → Mantener contratos asíncronos y adaptadores separados de React y del almacenamiento.

## Migration Plan

No hay migración remota. La versión inicial del snapshot es `1`; un snapshot incompatible se descarta de forma segura y se reemplaza por fixtures. La reversión consiste en restaurar la implementación anterior de la ruta y eliminar el cambio local, sin afectar datos remotos.
