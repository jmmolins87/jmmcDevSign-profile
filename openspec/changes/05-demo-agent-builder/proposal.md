# Proposal

## Why

La ruta actual de Agent Builder solo representa una configuración mínima y una prueba mock, mientras que la referencia `resources/05_demo_agent_builder` define una superficie completa de configuración, runtime y observabilidad. Este cambio permite revisar y demostrar esa experiencia con datos locales, sin bloquear una futura integración real.

## What Changes

- Sustituir la superficie reducida por la composición completa de la referencia visual.
- Añadir configuración de agente, conectores, fuentes, prompt, validación y despliegue mock.
- Añadir runtime conversacional con estados controlables, trazas y telemetría deterministas.
- Persistir el workspace mock en `localStorage` versionado.
- Separar contratos de dominio y adaptadores mock de la UI.
- Mantener la ruta pública y los tokens visuales existentes.
- Añadir cobertura unitaria, de componentes y E2E.

## Capabilities

### New Capabilities

- `agent-builder`: configuración, validación, despliegue mock y ejecución determinista de un agente.

### Modified Capabilities

- Ninguna. No existe todavía una capability equivalente en `openspec/specs/`.

## Impact

- Afecta a `app/es/demos/agent-builder`, los repositorios mock y los componentes de UI reutilizados.
- Añade contratos tipados para configuración, fuentes, runtime, validación y despliegue.
- Añade persistencia local aislada y fixtures deterministas.
- No añade dependencias ni llamadas externas.
- Requiere actualizar tests unitarios, componentes y E2E de la demo.
