# Proposal

## Why

La demo pública `/es/demos/orders-realtime` presenta una superficie reducida y no reproduce el flujo visual y operativo de pedidos, cocina y eventos realtime de la referencia. Esta capacidad permite validar una experiencia completa, determinista y accesible ahora, manteniendo una frontera clara para una futura integración de producción sin conectar proveedores externos.

## What Changes

- Sustituir la demo actual por la composición de referencia con navegación técnica, conexión, simulador, KPIs, cliente, separador full-duplex, KDS, stream de eventos y footer operativo.
- Añadir fixtures mock deterministas para los seis pedidos visibles, clientes, productos, importes, estados, latencias, tiempos, PIN y notificaciones de la referencia.
- Implementar carrito, cálculo de subtotal/IVA/total, emisión de pedidos y estados reproducibles del cliente.
- Implementar transiciones KDS, entrega, archivado, conexión, escenarios y stream con pausa, limpieza, filtro y límite de buffer.
- Persistir pedidos, carrito, KPIs, conexión, escenario y eventos mediante snapshot versionado, con validación, recuperación segura y fallback en memoria.
- Separar contratos de dominio, repositorio, transporte realtime y runtime de React, `localStorage` y proveedores externos.
- Mantener la ruta pública, el tema oscuro, la dirección brutalista editorial, responsive a 375px y 1440px, teclado, foco visible, regiones vivas y `prefers-reduced-motion`.
- Añadir pruebas unitarias, de componentes y E2E para dominio, persistencia, recuperación, flujos KDS, conexión, escenarios, stream, accesibilidad y responsive.

## Capabilities

### New Capabilities

- `orders-realtime`: superficie pública de pedidos y cocina con workspace mock determinista, estados de conexión, escenarios, stream de eventos, persistencia local y contratos desacoplados.

### Modified Capabilities

- Ninguna.

## Impact

- Afecta la página y componentes de `/es/demos/orders-realtime`, nuevos módulos de dominio, repositorio, transporte, runtime, estilos y pruebas.
- No añade APIs, migraciones, persistencia remota, autenticación, proveedores externos ni dependencias nuevas.
- Reutiliza tokens y primitivas UI existentes y conserva los fixtures de la referencia `resources/08_demo_orders_realtime`.
