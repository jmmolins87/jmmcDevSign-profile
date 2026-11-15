# SPEC 08 — Reconstrucción fiel de la demo Orders Realtime

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-11-15
> **Objective:** Sustituir la demo reducida de `/es/demos/orders-realtime` por una superficie de pedidos, cocina y eventos realtime fiel a `resources/08_demo_orders_realtime`, manteniendo todos los datos y flujos en mocks deterministas y dejando contratos preparados para una integración futura de producción.

## Scope

**In:**

- Reconstruir la superficie visual de `resources/08_demo_orders_realtime/screen.png` y `code.html`.
- Mantener la ruta `/es/demos/orders-realtime` pública, sin exigir sesión ni rol.
- Adoptar la composición de la referencia: navegación técnica, estado de conexión, simulador de escenarios, rail de KPIs, panel de cliente, separador full-duplex, tablero KDS, stream de eventos y footer operativo.
- Mantener exclusivamente el tema oscuro de la referencia y la dirección visual brutalista editorial: tipografías, tokens, hairlines, geometría cuadrada, densidad y uso limitado del naranja.
- Conservar los textos, pedidos, clientes, productos, importes, estados, latencias y eventos visibles en la referencia como fixtures iniciales.
- Implementar el panel de cliente `BRUTAL BURGER` con cantidades, subtotal, impuestos, total y emisión de pedidos.
- Implementar el tablero de cocina con las columnas `NUEVO`, `EN PLANCHA` y `LISTO`, incluyendo avance de pedidos, marcado como listo, entrega y archivado.
- Implementar los estados de conexión `CONECTADO`, `RECONECTANDO` y `OFFLINE`.
- Implementar los escenarios `EN VIVO (SINCRONIZADO)`, `NUEVO PEDIDO ENTRANTE (✦)`, `COCINA EN HORA PUNTA` y `LATENCIA ALTA (RECONECTANDO)`.
- Implementar el stream mock determinista con pausa/reanudación, limpieza de buffer y filtrado por identificador.
- Implementar la emulación de estado del cliente `CONFIRMADO`, `PREPARANDO TU PEDIDO` y `¡LISTO PARA RECOGER!`.
- Persistir pedidos, carrito, KPIs derivados, estado de conexión, escenario activo y eventos mediante un snapshot versionado en `localStorage`.
- Recuperar fixtures seguros cuando el snapshot sea inválido, incompatible, ilegible o el almacenamiento no esté disponible, mostrando feedback no bloqueante y accesible.
- Mantener contratos de dominio, repositorio y transporte realtime separados de React, `localStorage` y proveedores externos.
- Adaptar la composición a 375px y 1440px; en móvil usar las pestañas `{ CLIENTE } // ORDEN` y `{ COCINA } // KDS` de la referencia.
- Mantener nombres accesibles, foco visible, navegación por teclado, regiones vivas y respeto de `prefers-reduced-motion`.
- Añadir tests unitarios, de componentes y E2E para dominio, transiciones KDS, conexión, escenarios, stream, persistencia, accesibilidad y responsive.

**Out of scope (for future specs):**

- Conectar Supabase Realtime, WebSocket, SSE, una API propia o cualquier proveedor externo.
- Crear tablas, migraciones, políticas RLS o persistencia remota.
- Enviar pedidos reales, SMS, push notifications, emails, pagos o comunicaciones a clientes.
- Ejecutar workers, colas, cron jobs, telemetría de producción o despliegues reales.
- Implementar autenticación o permisos nuevos por acción.
- Añadir multiusuario, multi-workspace, sincronización entre dispositivos o resolución de conflictos.
- Compartir estado o fixtures con `/es/demos/leads-workflow`, `/es/demos/lead-qualification` o `/es/demos/business-backoffice`.
- Añadir gráficos, librerías realtime, drag-and-drop o dependencias nuevas.

## Data model

La implementación mantiene un workspace mock persistente. Los contratos no dependen de React, `localStorage`, Supabase, WebSocket ni de proveedores externos. Las marcas de tiempo y latencias son fixtures deterministas; el runtime no usa `Date`, `Math.random`, red ni intervalos aleatorios.

### Orders workspace

```ts
type OrderStatus = "new" | "cooking" | "ready" | "delivered" | "archived";

type OrderConnectionState = "connected" | "reconnecting" | "offline";

type OrderScenario = "live" | "incoming" | "rush" | "high_latency";

type ClientOrderStatus = "confirmed" | "cooking" | "ready";

type MobileOrdersView = "client" | "kitchen";

type OrderItemId = "smash" | "fries" | "drink";

type OrderItem = {
  id: OrderItemId;
  name: string;
  description: string;
  unitPrice: number;
  quantity: number;
};

type MockOrder = {
  id: string;
  customer: string;
  customerShort: string;
  serviceType: "takeaway" | "delivery" | "table";
  tableLabel: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  elapsedLabel: string;
  lastEvent: string;
  pin?: string;
  notification?: string;
};

type OrderStreamEventType =
  | "IN"
  | "OUT"
  | "WSS"
  | "SYS"
  | "WARN"
  | "ERR"
  | "SCENARIO"
  | "FILTER"
  | "HEARTBEAT"
  | "CLIENT"
  | "RUSH";

type OrderStreamEvent = {
  id: string;
  orderId?: string;
  type: OrderStreamEventType;
  message: string;
  latency: string;
  at: string;
};

type OrdersWorkspace = {
  version: 1;
  orders: MockOrder[];
  orderCounter: number;
  ordersToday: number;
  totalRevenue: number;
  cart: Record<OrderItemId, number>;
  connectionState: OrderConnectionState;
  scenario: OrderScenario;
  clientStatus: ClientOrderStatus;
  streamPaused: boolean;
  streamFilter: string;
  events: OrderStreamEvent[];
};
```

Los fixtures iniciales deben conservar los pedidos visibles en la referencia: `B-842` de Elena R., `B-841` de David S., `B-839` de Marcus V., `B-840` de Laura C., `B-838` de Sofia B. y `B-837` de Carlos M., junto con sus estados, productos, importes, tiempos, mesa, PIN y notificaciones. El carrito inicial contiene una unidad de `SMASH DOBLE MADURADA`, una de `PATATAS CORTE FINO TRUFADAS` y una de `KOMBUCHA ARTESANA // LIMA`, con subtotal `22,10 €`, IVA `2,21 €` y total `24,31 €`.

Los valores iniciales de la referencia son `312` pedidos hoy, `7.737,60 €` de ventas en vivo, `8m 42s` de preparación media, `24,80 €` de ticket medio y conexión `24ms`. Los escenarios pueden modificar estos valores y eventos de forma determinista, pero no deben generar números aleatorios ni usar el reloj del sistema.

### Contracts

```ts
interface OrdersRepository {
  getWorkspace(): Promise<OrdersWorkspace>;
  updateWorkspace(input: Partial<OrdersWorkspace>): Promise<OrdersWorkspace>;
  addOrder(order: MockOrder): Promise<MockOrder>;
  updateOrder(id: string, input: Partial<MockOrder>): Promise<MockOrder>;
  appendEvent(event: OrderStreamEvent): Promise<OrderStreamEvent>;
  clearEvents(): Promise<OrdersWorkspace>;
  resetWorkspace(): Promise<OrdersWorkspace>;
}

interface OrdersRealtimeTransport {
  getConnectionState(): Promise<OrderConnectionState>;
  setConnectionState(input: { state: OrderConnectionState }): Promise<OrderConnectionState>;
  publish(event: OrderStreamEvent): Promise<OrderStreamEvent>;
  subscribe(listener: (event: OrderStreamEvent) => void): () => void;
}

interface OrdersRuntimeService {
  updateCart(input: { item: OrderItemId; delta: number }): Promise<OrdersWorkspace>;
  dispatchOrder(): Promise<{ workspace: OrdersWorkspace; order: MockOrder }>;
  advanceOrder(input: { orderId: string; target: "cooking" | "ready" }): Promise<OrdersWorkspace>;
  deliverOrder(input: { orderId: string }): Promise<OrdersWorkspace>;
  simulateClientStatus(input: { status: ClientOrderStatus }): Promise<OrdersWorkspace>;
  setConnectionState(input: { state: OrderConnectionState }): Promise<OrdersWorkspace>;
  triggerScenario(input: { scenario: OrderScenario }): Promise<OrdersWorkspace>;
  toggleStreamPause(): Promise<OrdersWorkspace>;
  clearStream(): Promise<OrdersWorkspace>;
  filterStream(input: { filter: string }): Promise<OrdersWorkspace>;
}
```

Los componentes consumen estos contratos y no acceden directamente a fixtures, `localStorage`, eventos del navegador ni proveedores externos. `OrdersRealtimeTransport` modela la futura suscripción realtime, pero su implementación de esta spec es local, determinista y sustituible.

### Validation

El carrito solo acepta cantidades enteras mayores o iguales que cero. Los importes se recalculan desde los precios de los fixtures: subtotal, IVA del 10% y total. La emisión crea un identificador único, incrementa los KPIs, añade un evento `IN` y coloca el pedido en `NUEVO`.

Las transiciones válidas del KDS son `new -> cooking -> ready -> delivered -> archived`. No se deben crear eventos duplicados al repetir una acción sobre un pedido que ya alcanzó el estado solicitado. Entregar o archivar un pedido ya retirado es idempotente y no rompe el workspace.

La conexión solo acepta `connected`, `reconnecting` u `offline`. Pausar el stream impide añadir nuevos eventos automáticos o derivados de simulación hasta reanudarlo; las operaciones de negocio siguen actualizando el workspace y deben dejar feedback visible si el evento no se pudo añadir al buffer.

El snapshot se valida antes de restaurarse: versión, campos requeridos, ids únicos, estados permitidos, cantidades no negativas, importes finitos, conexión válida, escenario válido y eventos con estructura completa. Si falla, se eliminan los datos inválidos, se restauran fixtures seguros y se usa un fallback en memoria con aviso accesible.

## Implementation plan

1. Crear tipos, estados, constantes, fixtures, contratos y validadores del dominio Orders Realtime.
2. Implementar el repositorio mock persistente con snapshot versionado, fallback en memoria, recuperación segura y reset.
3. Implementar el transporte realtime local con suscripción, publicación y estados de conexión deterministas.
4. Implementar el runtime mock para carrito, emisión, transición KDS, entrega, estado del cliente y escenarios.
5. Implementar el stream de eventos con buffer máximo, pausa/reanudación, limpieza y filtro por ID.
6. Sustituir el panel actual por la composición completa de la referencia reutilizando tokens y primitivas UI existentes.
7. Implementar navegación técnica, conexión, simulador, rail de KPIs y sparkline estático de la referencia.
8. Implementar el panel de cliente con teléfono mock, estado realtime, productos, cantidades, totales y emisión.
9. Implementar el separador full-duplex y el tablero KDS con tarjetas, acciones y transiciones visuales.
10. Implementar el terminal de eventos, feedback `aria-live`, estados vacíos, offline, reconectando y buffer reiniciado.
11. Implementar las pestañas móviles, scroll, foco, teclado y respeto de `prefers-reduced-motion`.
12. Añadir tests unitarios y de componentes para dominio, repositorio, transporte, runtime, KDS, escenarios y recuperación.
13. Actualizar el flujo E2E de la demo y verificar 375px y 1440px en Chromium y Firefox.
14. Ejecutar lint, typecheck, tests, build, E2E y validación estricta de OpenSpec.
15. Documentar la frontera futura de producción sin introducir integraciones remotas ni dependencias nuevas.

## Acceptance criteria

- [x] `/es/demos/orders-realtime` reproduce la composición principal de `screen.png` sin errores de runtime.
- [x] La superficie incluye navegación técnica, estado de conexión, simulador, cuatro KPIs, cliente, separador full-duplex, KDS, stream y footer.
- [x] La apariencia conserva tema oscuro, tipografías, tokens, hairlines, geometría cuadrada, densidad y acento naranja de la referencia.
- [x] El registro inicial contiene `B-842`, `B-841`, `B-839`, `B-840`, `B-838` y `B-837` con clientes, productos, estados, importes y metadata de la referencia.
- [x] El carrito inicial muestra una unidad de cada producto y calcula `22,10 €`, `2,21 €` y `24,31 €`.
- [x] Los controles `+` y `−` cambian cantidades sin permitir valores negativos y recalculan subtotal, IVA y total.
- [x] `ENVIAR PEDIDO [ PEDIR ↵ ]` crea un pedido único en `NUEVO`, actualiza pedidos/ventas y añade un evento `WSS:IN` determinista.
- [x] El KDS permite mover pedidos de `NUEVO` a `EN PLANCHA`, de `EN PLANCHA` a `LISTO` y entregar/archivar sin duplicar eventos.
- [x] `→ LISTO`, `→ PLANCHA` y `→ NUEVO` actualizan el estado del cliente y su barra de progreso de forma reproducible.
- [x] `CONECTADO`, `RECONECTANDO` y `OFFLINE` actualizan etiqueta, icono, latencia y evento técnico correspondiente.
- [x] Los escenarios `EN VIVO (SINCRONIZADO)`, `NUEVO PEDIDO ENTRANTE (✦)`, `COCINA EN HORA PUNTA` y `LATENCIA ALTA (RECONECTANDO)` producen estados y eventos mock deterministas.
- [x] El stream permite pausar/reanudar, limpiar el buffer y filtrar por identificador sin llamadas de red.
- [x] El buffer conserva como máximo 40 eventos y muestra el mensaje de reinicio definido por la referencia al limpiarse.
- [x] Pedidos, carrito, KPIs, conexión, escenario y eventos se recuperan tras recargar mediante `localStorage` versionado.
- [x] Un snapshot corrupto, incompatible o ilegible restaura fixtures seguros y muestra feedback no bloqueante en una región accesible.
- [x] La ruta funciona sin sesión ni rol y no ejecuta llamadas de red ni proveedores reales.
- [x] Existen contratos independientes de la UI para repositorio, transporte realtime y runtime.
- [x] La UI funciona a 375px y 1440px sin pérdida de controles principales ni desbordamiento horizontal de página.
- [x] En móvil funcionan las pestañas `{ CLIENTE } // ORDEN` y `{ COCINA } // KDS`, conservando el estado al cambiar de vista.
- [x] Los controles tienen nombre accesible, foco visible, navegación por teclado y feedback en regiones vivas.
- [x] Las animaciones respetan `prefers-reduced-motion` y no dependen de intervalos aleatorios.
- [x] No se añaden dependencias nuevas.
- [x] `pnpm lint` pasa.
- [x] `pnpm typecheck` pasa.
- [x] `pnpm test` pasa.
- [x] `pnpm build` pasa.
- [x] `pnpm test:e2e` pasa en móvil y escritorio.

## Nota de verificación

- 2026-11-15: verificación independiente completada para `08-demo-orders-realtime`; dictamen `APPROVED`, 27/27 criterios PASS.

## Traceability

| Requirement | Task | Test | Verification |
| --- | --- | --- | --- |
| REQ-001 | TASK-006, TASK-007 | TEST-E2E-ORDERS, TEST-E2E-REGRESSION | VERIFY-PASS |
| REQ-002 | TASK-001 | TEST-UNIT-FIXTURES | VERIFY-PASS |
| REQ-003 | TASK-008 | TEST-UNIT-CART, TEST-COMPONENT-CLIENT | VERIFY-PASS |
| REQ-004 | TASK-009 | TEST-UNIT-KDS, TEST-COMPONENT-KDS, TEST-E2E-ORDERS | VERIFY-PASS |
| REQ-005 | TASK-003, TASK-004, TASK-010 | TEST-UNIT-CONNECTION, TEST-COMPONENT-SCENARIOS | VERIFY-PASS |
| REQ-006 | TASK-005, TASK-010 | TEST-UNIT-STREAM, TEST-COMPONENT-STREAM | VERIFY-PASS |
| REQ-007 | TASK-002, TASK-012 | TEST-UNIT-REPOSITORY, TEST-E2E-RECOVERY | VERIFY-PASS |
| REQ-008 | TASK-003, TASK-004 | TEST-UNIT-CONTRACTS, TEST-UNIT-RUNTIME | VERIFY-PASS |
| REQ-009 | TASK-011 | TEST-A11Y, TEST-E2E-KEYBOARD | VERIFY-PASS |
| REQ-010 | TASK-011, TASK-013 | TEST-E2E-RESPONSIVE | VERIFY-PASS |
| REQ-011 | TASK-014 | TEST-QUALITY-GATES | VERIFY-PASS |
| REQ-012 | TASK-015 | TEST-QUALITY-GATES, TEST-SPEC-VALIDATION | VERIFY-PASS |

The requirement identifiers above map to the twelve planned OpenSpec requirements in the same order: visual/public surface, reference fixtures, client cart, KDS transitions, connection/scenarios, stream controls, persistence/recovery, decoupled contracts, accessibility, responsive behavior, dependency boundary and quality gates.

### Verification evidence

| Test ID | Evidence |
| --- | --- |
| TEST-UNIT-FIXTURES | Pendiente de implementación: test de fixtures y valores iniciales. |
| TEST-UNIT-CART | Pendiente de implementación: test de cantidades, subtotal, IVA y total. |
| TEST-UNIT-KDS | Pendiente de implementación: test de transiciones e idempotencia. |
| TEST-UNIT-CONNECTION | Pendiente de implementación: test de estados de conexión y latencias. |
| TEST-UNIT-STREAM | Pendiente de implementación: test de pausa, limpieza, filtro y límite de 40 eventos. |
| TEST-UNIT-REPOSITORY | Pendiente de implementación: test de snapshot válido, inválido y fallback. |
| TEST-UNIT-RUNTIME | Pendiente de implementación: test de escenarios y runtime determinista. |
| TEST-COMPONENT-CLIENT | Pendiente de implementación: test de cantidades, estado y emisión. |
| TEST-COMPONENT-KDS | Pendiente de implementación: test de tarjetas y acciones del KDS. |
| TEST-COMPONENT-SCENARIOS | Pendiente de implementación: test de simuladores de conexión y escenarios. |
| TEST-COMPONENT-STREAM | Pendiente de implementación: test de controles del terminal. |
| TEST-A11Y | Pendiente de implementación: nombres, foco, teclado y regiones vivas. |
| TEST-E2E-ORDERS | Pendiente de implementación: flujo completo en navegador. |
| TEST-E2E-RECOVERY | Pendiente de implementación: recuperación de snapshot corrupto. |
| TEST-E2E-RESPONSIVE | Pendiente de implementación: 375px y 1440px en Chromium y Firefox. |
| TEST-E2E-KEYBOARD | Pendiente de implementación: navegación de controles por teclado. |
| TEST-E2E-REGRESSION | `pnpm test:e2e` pendiente de ejecución tras implementar la demo. |
| TEST-QUALITY-GATES | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `openspec validate` pendientes. |
| TEST-SPEC-VALIDATION | Pendiente de crear y validar el cambio OpenSpec `08-demo-orders-realtime`. |

## Decisions

- **Sí:** reconstrucción fiel de la referencia, no solo ampliación de la tabla actual.
- **Sí:** demo completa con cliente, KDS, conexión, escenarios, stream y transiciones.
- **Sí:** datos iniciales exactos de `screen.png` y `code.html` como fixtures mock.
- **Sí:** persistir workspace, carrito, conexión, escenario y eventos en `localStorage` versionado.
- **Sí:** separar repositorio y transporte realtime para poder sustituir los mocks por API, WebSocket o Supabase Realtime sin cambiar los componentes.
- **Sí:** usar una secuencia de eventos determinista, pausible y sin reloj real, aleatoriedad ni red.
- **Sí:** mantener la ruta pública y sin permisos nuevos por acción.
- **Sí:** usar solo el tema oscuro de la referencia.
- **Sí:** mantener las dependencias actuales y no instalar librerías nuevas.
- **Sí:** español como idioma de interfaz y términos técnicos en inglés cuando formen parte del dominio.
- **No:** conectar proveedores reales, emitir comunicaciones, persistir remotamente o simular sincronización multiusuario.

## Risks

| Risk | Mitigation |
| --- | --- |
| La captura contiene una superficie más densa que el panel actual | Implementar primero la estructura completa y verificar capturas a 375px y 1440px. |
| El stream puede parecer una integración real | Etiquetar conexión, latencias, eventos y proveedores como mock/demo y documentar la frontera futura. |
| `localStorage` puede estar corrupto, bloqueado o lleno | Validar snapshots, recuperar fixtures seguros, usar fallback en memoria y mostrar aviso accesible. |
| Las transiciones KDS pueden duplicar pedidos o eventos | Aplicar estados válidos, ids únicos e idempotencia por pedido y acción. |
| El cálculo de importes puede desviarse de la referencia | Mantener precios e importes fixture, usar una única función de cálculo y cubrirla con tests. |
| La interfaz móvil puede ocultar controles del flujo completo | Usar las dos pestañas requeridas, conservar el estado al cambiar de vista y cubrir ambos recorridos en E2E. |
| La integración futura puede quedar acoplada a mocks | Mantener contratos asíncronos, transporte independiente y adaptadores separados de React y almacenamiento. |

## What is **not** in this spec

- Supabase Realtime, Supabase Database, Auth, Storage o RLS.
- WebSocket, SSE, APIs propias, proveedores de pagos, SMS, push, email o delivery.
- Envío real de pedidos o notificaciones a clientes.
- Workers, colas, cron, telemetría de producción o despliegues reales.
- Gestión multiusuario, multi-workspace, colaboración o sincronización entre dispositivos.
- Drag-and-drop, gráficos interactivos o nuevas dependencias.
- Integración de datos con las demás demos.
- Internacionalización fuera de `/es/`.
