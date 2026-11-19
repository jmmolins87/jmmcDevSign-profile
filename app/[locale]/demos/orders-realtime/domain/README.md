# Orders Realtime mock domain

La demo usa un workspace local y determinista. No abre conexiones WebSocket,
SSE ni HTTP, no depende del reloj del sistema y no integra proveedores externos.
El objetivo es que la superficie visual pueda ejercitar estados de cliente,
cocina y stream sin convertir la demo en una dependencia de infraestructura.

## Frontera de producción

La UI solo conoce estos contratos:

- `OrdersRepository`: lectura, actualización, pedidos, eventos y reset.
- `OrdersRealtimeTransport`: estado de conexión, publicación y suscripción.
- `OrdersRuntimeService`: operaciones de negocio del carrito, pedido, KDS,
  conexión, escenarios y stream.

Las instancias exportadas (`ordersRepository`, `ordersRealtimeTransport` y
`ordersRuntimeService`) son adaptadores locales. Una futura integración de
producción debe implementar los mismos contratos detrás de una composición
distinta; no debe introducir acceso remoto en `orders-panel.tsx` ni reutilizar
`localStorage` como fuente de verdad distribuida.

## Snapshot local

El repositorio persiste el workspace bajo `ORDERS_STORAGE_KEY` y valida el
objeto completo antes de restaurarlo. El formato actual es `version: 1` e
incluye pedidos, carrito, KPIs, conexión, escenario, estado del cliente y
eventos. Los eventos se deduplican por `id` y el buffer conserva como máximo
`ORDER_EVENT_BUFFER_LIMIT` (`40`) entradas.

Si el JSON es ilegible, la versión no coincide, faltan campos o los valores
violan los estados/importe/cantidad permitidos, se eliminan los datos inválidos
y se recuperan los fixtures seguros. Si el almacenamiento no está disponible o
no admite escritura, el repositorio continúa en memoria y expone un aviso no
bloqueante mediante `consumePersistenceWarning()`.

## Sustitución futura

Una integración real debería resolver fuera de este módulo:

1. persistencia remota y control de concurrencia;
2. autenticación, autorización y aislamiento por workspace;
3. transporte realtime, reconexión y entrega al menos una vez;
4. validación de payloads en el servidor, observabilidad y auditoría.

La demo no simula esos controles como si fueran producción: solo conserva la
forma del contrato y el comportamiento determinista necesario para probar la
experiencia.
