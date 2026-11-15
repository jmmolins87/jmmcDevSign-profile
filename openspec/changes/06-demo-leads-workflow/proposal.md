# Proposal

## Why

La ruta `/es/demos/leads-workflow` todavía muestra un kanban reducido y no representa la referencia visual ni el flujo de orquestación de leads. Esta capacidad permite validar una demo operativa completa con datos deterministas antes de conectar proveedores reales.

## What Changes

- Sustituir el kanban por un shell de orquestación con header, command bar, telemetría, presets, canvas, registro lateral y footer.
- Añadir un dominio mock de workflows, nodos, conexiones, leads y eventos de auditoría.
- Añadir presets, simulación de disparo, ejecución de test, alta local de nodos, zoom, reset, auto-align y despliegue mock.
- Persistir workflow, leads, nodos, eventos, filtros, preset y despliegue mediante un snapshot versionado de `localStorage`.
- Añadir registro filtrable, detalle de lead y drawer accesible en móvil.
- Añadir pruebas unitarias, de componentes y E2E para los flujos, la persistencia, la accesibilidad y los tamaños objetivo.
- Mantener la ruta pública, sin red, sin proveedores externos y sin nuevas dependencias.

## Capabilities

### New Capabilities

- `leads-workflow`: Orquestación mock persistente de workflows de leads, registro operativo y despliegue local.

### Modified Capabilities

- Ninguna.

## Impact

- Afecta `app/es/demos/leads-workflow`, nuevos módulos de dominio y repositorio mock, estilos de la demo y sus pruebas.
- No cambia contratos HTTP, Supabase, autenticación, migraciones ni dependencias del proyecto.
- Reutiliza los tokens y primitivas UI existentes y la referencia en `resources/06_demo_leads_workflow`.
