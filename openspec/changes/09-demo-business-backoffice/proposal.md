# Proposal

## Why

La ruta pública `/es/demos/business-backoffice` solo ofrece actualmente un panel operativo reducido y no representa la demo Business Backoffice definida en la especificación aprobada ni en sus referencias visuales. Esta reconstrucción aporta una superficie empresarial completa, determinista y demostrable sin introducir integraciones reales ni dependencias externas.

## What Changes

- Sustituir el panel reducido por una superficie de backoffice empresarial fiel a la referencia visual y accesible en `/es/demos/business-backoffice`.
- Añadir la composición técnica de cabecera, navegación lateral, búsqueda `FIND_SYS`, periodo, sincronización, selector de rol y simulador de estados.
- Añadir métricas, gráfica SVG de facturación, pedidos filtrables y paginados, pedido manual y exportación CSV local.
- Añadir expediente de cliente con drawer, historial, anotaciones y acciones autorizadas.
- Añadir facturas pendientes, emisión idempotente, alertas de stock, actualización de inventario y audit log mock.
- Implementar los roles mock `ADMIN`, `EDITOR` y `LECTOR`, incluyendo bloqueo accesible de mutaciones y feedback de acceso restringido.
- Separar contratos de dominio, política de permisos, repositorio, runtime y exportador CSV de la composición React.
- Persistir y recuperar un snapshot versionado en `localStorage`, con validación, recuperación segura y fallback en memoria.
- Cubrir responsive a 375px y 1440px, teclado, foco, `Escape`, regiones vivas y `prefers-reduced-motion`.
- Añadir pruebas unitarias, de componentes y E2E, además de los quality gates de lint, tipos, tests, build y validación OpenSpec.
- No añadir dependencias nuevas ni conexiones a Supabase, APIs, CRM, ERP, Stripe, email u otros proveedores reales.

## Capabilities

### New Capabilities

- `business-backoffice`: superficie pública de backoffice empresarial con workspace mock persistente, métricas, pedidos, clientes, facturas, inventario, auditoría, roles, simulador y contratos locales sustituibles.

### Modified Capabilities

- Ninguna.

## Impact

- Afecta la ruta, el panel y los módulos de dominio bajo `app/es/demos/business-backoffice/`, además de los tests unitarios, de componentes y E2E relacionados.
- Reutiliza los tokens y primitivas UI existentes, pero requiere ampliar o sustituir la composición visual actual.
- Introduce únicamente persistencia local versionada y descarga CSV en el navegador; no cambia contratos remotos ni infraestructura.
- Mantiene la ruta pública sin autenticación real y limita la autorización a una política mock de dominio.
- La referencia visual se usará como fuente de presentación, mientras que la spec aprobada será la fuente de comportamiento, datos y criterios verificables.
