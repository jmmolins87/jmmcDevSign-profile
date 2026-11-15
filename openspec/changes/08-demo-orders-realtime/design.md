# Design

## Context

La ruta `/es/demos/orders-realtime` debe sustituir un panel reducido por una superficie densa de pedidos y cocina basada en la referencia de `resources/08_demo_orders_realtime`. El proyecto ya dispone de tokens y primitivas UI reutilizables; la demo debe seguir siendo pública, local, determinista y sin dependencias nuevas. Los requisitos funcionales están definidos en `specs/orders-realtime/spec.md`.

## Goals / Non-Goals

**Goals:**

- Separar tipos, fixtures, validadores, transiciones y contratos de los adaptadores de almacenamiento, transporte y la composición React.
- Mantener un único snapshot versionado del workspace y recuperar fixtures seguros ante cualquier fallo de validación o disponibilidad de almacenamiento.
- Reproducir la composición visual de referencia en escritorio y móvil, incluyendo las regiones de cliente, KDS, conexión, escenarios y stream.
- Hacer idempotentes la emisión, las transiciones KDS, la entrega, el archivado, la limpieza y las simulaciones.
- Cubrir el comportamiento, accesibilidad, responsive y recuperación con pruebas deterministas del proyecto.

**Non-Goals:**

- Integrar Supabase Realtime, WebSocket, SSE, APIs HTTP, proveedores de pagos, delivery, SMS, push o email.
- Crear tablas, migraciones, RLS, autenticación, permisos nuevos, workers, colas, cron jobs, telemetría o despliegues de producción.
- Añadir multiusuario, sincronización entre dispositivos, resolución de conflictos, drag-and-drop, gráficos o dependencias nuevas.
- Compartir estado o fixtures con otras demos.

## Decisions

1. **Capas de dominio y adaptadores.** Los tipos del workspace, fixtures, validadores, reglas de importes y transiciones vivirán fuera de React. Un repositorio mock manejará lectura, actualización, eventos y reset; un transporte local modelará conexión, publicación y suscripción; el runtime compondrá las operaciones de negocio. Se elige esta frontera frente a acceder directamente a fixtures desde los componentes para que un proveedor futuro pueda sustituirse sin rediseñar la UI.

2. **Snapshot único versionado.** El repositorio persistirá una representación completa con `version: 1`, pedidos, contador, KPIs, carrito, conexión, escenario, estado del cliente y eventos. Antes de restaurar se validarán versión, campos requeridos, ids únicos, estados permitidos, cantidades no negativas, importes finitos y estructura de eventos. Se elige un snapshot atómico frente a varias claves independientes para evitar restauraciones parciales.

3. **Runtime determinista e idempotente.** Latencias, tiempos relativos, ids fixture, mensajes y escenarios procederán de constantes y contadores locales. No se utilizarán `Date`, `Math.random`, red ni intervalos aleatorios. Las acciones repetidas comprobarán el estado actual antes de añadir eventos o cambiarlo. Se elige este enfoque frente a simulaciones temporales para que tests y capturas sean reproducibles.

4. **Stream con buffer explícito.** Los eventos se almacenarán en el workspace con pausa, reanudación, limpieza, filtro por id y un límite de 40 entradas. Cuando el stream esté pausado, una operación de negocio podrá actualizar el workspace, pero el runtime anunciará que el evento no entró en el buffer. Se elige un buffer local frente a una librería realtime porque el alcance exige una frontera mock sustituible, no conectividad real.

5. **Composición por regiones y pestañas móviles.** El shell se dividirá en navegación/conexión, simulador, KPIs, cliente, separador full-duplex, KDS, terminal y footer. En 375px, cliente/orden y cocina/KDS se expondrán mediante las pestañas de la referencia; en 1440px se mantendrá la composición completa. Se reutilizarán tokens y primitivas existentes frente a una nueva librería de componentes.

6. **Accesibilidad y movimiento condicionado.** Los controles serán semánticos, tendrán foco visible y nombres accesibles; las mutaciones anunciarán resultados en una región viva. Las animaciones se implementarán con la solución existente y se desactivarán o suavizarán con `prefers-reduced-motion`. Se elige esta estrategia frente a animaciones obligatorias para conservar información y operabilidad.

7. **Recuperación sin bloqueo.** Si la lectura o escritura de `localStorage` falla, el repositorio continuará con un estado en memoria basado en fixtures seguros y el shell mostrará un aviso no bloqueante. Se evita propagar la excepción a la página o presentar datos corruptos como válidos.

## Risks / Trade-offs

- [La referencia tiene una densidad superior al panel actual] → construir la estructura completa por regiones y verificar capturas a 375px y 1440px.
- [Los estados mock pueden parecer una integración real] → etiquetar conexión, latencias, eventos y escenarios como demo/mock y documentar la frontera futura.
- [`localStorage` puede estar corrupto, bloqueado o lleno] → validar antes de restaurar, usar fixtures seguros, fallback en memoria y feedback accesible.
- [Las transiciones KDS pueden duplicar pedidos o eventos] → validar la máquina de estados y aplicar idempotencia por pedido y acción.
- [Los importes pueden desviarse de la referencia] → centralizar el cálculo en los precios fixture y cubrir subtotal, IVA y total con tests.
- [La navegación móvil puede ocultar controles] → conservar el workspace al cambiar de pestaña y cubrir ambos recorridos con E2E.

## Migration Plan

1. Sustituir el panel actual en la misma ruta y mantener su acceso público.
2. Introducir una clave y versión propias para el snapshot; descartar de forma segura cualquier snapshot ausente o incompatible.
3. Actualizar los tests unitarios, de componentes y E2E de la demo sin alterar otras demos.
4. Para rollback, restaurar el panel anterior y retirar los módulos locales de Orders Realtime; no hay datos remotos que migrar ni revertir.
