# Agent Builder mock domain

Este módulo contiene la frontera de dominio de la demo Agent Builder. La UI consume contratos, no accede directamente a `localStorage` ni a los fixtures.

## Contratos

- `AgentBuilderRepository`: obtiene, actualiza y reinicia la configuración persistida del agente.
- `AgentRuntimeService`: ejecuta prompts, cambia estados, reinicia la conversación y despliega una versión local.
- `AgentConfigValidator`: valida campos obligatorios y exige al menos un conector activo antes del despliegue.

## Adaptadores actuales

`agent-builder-repository.ts` implementa un repositorio local con la clave versionada `jmmcdevsign:agent-builder:v1`. La hidratación valida la versión y la forma del snapshot; si `localStorage` no está disponible, contiene JSON inválido o el snapshot no es compatible, restaura fixtures seguros y continúa en memoria.

`agent-builder-runtime.ts` implementa el adaptador mock determinista. Las respuestas, la latencia, el consumo, las marcas temporales y la versión `local-*` proceden de constantes locales. No usa reloj, aleatoriedad, red, proveedor LLM ni credenciales.

## Sustitución futura por producción

Una integración real puede añadir adaptadores que implementen los mismos contratos y conservar la UI y el modelo de validación. Ese cambio deberá introducir explícitamente autenticación, autorización, manejo de secretos, límites de red, observabilidad y persistencia remota en una spec posterior. La demo actual no sube archivos, no lee URLs y no ejecuta llamadas HTTP.
