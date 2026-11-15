# Proposal

## Why

La demo pública `/es/demos/lead-qualification` presenta hoy una superficie reducida y no reproduce el flujo de cualificación de leads de la referencia. Esta spec sustituye esa superficie por una demo determinista y completa, preparada para una futura integración de producción sin conectar proveedores externos ahora.

## What Changes

- Reconstruir la composición visual de `resources/07_demo_lead_qualification/screen.png` y `code.html`.
- Mantener la ruta pública sin sesión ni rol, con shell editorial brutalista, header fijo, command bar, simulador, KPIs, bandeja, expediente, secuencia y footer.
- Incorporar los cinco leads mock, selección, score, tier, búsqueda, filtros, estados reproducibles y acciones de aprobación, reasignación, edición, recarga e inyección.
- Persistir el workspace mock mediante un snapshot versionado en `localStorage`, con validación, recuperación segura y fallback en memoria.
- Separar contratos de dominio y adaptadores mock de React, almacenamiento y proveedores externos.
- Cubrir responsive a 375px y 1440px, pestañas móviles, teclado, foco, diálogos accesibles, regiones vivas y `prefers-reduced-motion`.
- Añadir tests unitarios, de componentes y E2E para dominio, estados, filtros, acciones, persistencia, accesibilidad y responsive.

## Capabilities

### New Capabilities

- `lead-qualification`: superficie pública de cualificación de leads con workspace mock determinista, acciones, estados, persistencia local y contratos desacoplados.

### Modified Capabilities

- No aplica; no existen capacidades OpenSpec previas en este repositorio.

## Impact

- Afecta la página y componentes de la demo `/es/demos/lead-qualification`, sus estilos, fixtures, adaptadores mock y tests.
- No añade APIs, migraciones, dependencias ni proveedores externos.
- Mantiene los datos en mocks y deja contratos asíncronos preparados para integración futura.
