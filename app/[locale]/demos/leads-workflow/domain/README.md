# Leads workflow: frontera de producción

Este módulo implementa un dominio local y determinista para la demo pública de Leads Workflow.

## Alcance actual

- `workflow-fixtures.ts` contiene los nodos, leads y eventos de demostración.
- `workflow-repository.ts` mantiene un snapshot versionado en memoria y, cuando está disponible, en `localStorage`.
- `workflow-runtime.ts` simula presets, disparos y trazas sin reloj, aleatoriedad ni red.
- `workflow-deployment.ts` valida el grafo y registra un despliegue local con una versión fija.
- `workflow-contracts.ts` define las fronteras que permitirían sustituir los mocks por adaptadores de producción.

## Sustitución futura

Una integración real debe implementar los contratos del dominio en un adaptador separado. La UI no debe conocer detalles de persistencia, proveedores externos, credenciales ni transporte. La integración deberá aportar, como mínimo:

1. persistencia remota versionada y migraciones explícitas;
2. autenticación, autorización y validación de entrada en el servidor;
3. idempotencia para disparos, eventos y despliegues;
4. observabilidad y manejo de errores sin exponer secretos;
5. pruebas de contrato antes de activar tráfico real.

La demo no hace llamadas de red ni contiene secretos, migraciones o dependencias de proveedores. Los datos fixture y los mensajes de auditoría son intencionadamente estables para que las pruebas unitarias y E2E sean reproducibles.
