# Design

## Context

La ruta actual `app/es/demos/agent-builder` usa un `AgentConfig` reducido y un repositorio mock genérico. La referencia HTML define una superficie más amplia: configuración en columna izquierda, runtime conversacional en columna derecha, matriz de estados, fuentes, conectores, prompt, telemetría y acciones de despliegue. El sistema visual y las primitivas accesibles ya existen en `app/globals.css` y `app/components/ui`.

## Goals / Non-Goals

**Goals:**

- Reproducir la jerarquía visual y densidad de la referencia sin introducir otro sistema de diseño.
- Separar dominio, persistencia mock y runtime mock de los componentes React.
- Hacer deterministas las acciones para que puedan demostrarse y probarse.
- Mantener una ruta pública, responsive y accesible; la autenticación no forma parte del acceso a la demo.
- Dejar una frontera clara para futuros adaptadores de producción.

**Non-Goals:**

- Integrar proveedores externos.
- Crear un esquema remoto o migraciones.
- Resolver multi-agente, multi-workspace o colaboración.
- Crear una abstracción genérica para todas las demos.

## Decisions

### 1. Un dominio específico para Agent Builder

Se ampliará el modelo de agente con estado, conectores, fuentes, revisión, configuración contextual y conversación. Se elige un dominio específico porque los datos y transiciones de esta demo no coinciden con el resto de repositorios mock.

Alternativa descartada: mantener `AgentConfig` genérico y almacenar campos adicionales en objetos parciales; dificultaría validación, persistencia segura y futura integración.

### 2. Puertos de repositorio y runtime con adaptadores mock

La UI consumirá contratos de lectura/escritura, validación y ejecución. Los adaptadores mock usarán fixtures y persistencia local, sin que los componentes conozcan `localStorage` o los proveedores futuros.

Alternativa descartada: llamar al repositorio mock directamente desde cada handler; sería más rápido, pero repetiría reglas y haría más costosa la sustitución por backend.

### 3. Persistencia local versionada

El workspace usará una clave versionada y validará el snapshot al hidratarlo. Ante datos corruptos se restaurarán fixtures seguros y se mantendrá la demo operativa.

Alternativa descartada: memoria únicamente; no permitiría demostrar la continuidad entre recargas solicitada para la demo.

### 4. Runtime determinista y estados controlables

Los prompts y estados usarán fixtures estables. La matriz permitirá seleccionar estados directamente, mientras que el envío de prompts mostrará una traza predecible.

Alternativa descartada: temporizadores y respuestas aleatorias; aportarían apariencia de streaming, pero introducirían flakiness y no son necesarios para validar la experiencia.

### 5. Adaptación responsive por apilado

En desktop se conservará la composición de dos columnas. En móvil se apilarán configuración y runtime, con overflow horizontal limitado a bloques técnicos.

Alternativa descartada: mantener dos columnas comprimidas en móvil; reduciría legibilidad y dificultaría el teclado.

## Risks / Trade-offs

- **Densidad visual alta** → reutilizar tokens, mantener secciones con headings claros y verificar 375px/1440px.
- **Persistencia local no segura** → etiquetar la superficie como mock y no guardar secretos ni credenciales.
- **Diferencias entre referencia y primitivas existentes** → adaptar la composición a tokens actuales; no copiar HTML externo ni introducir valores arbitrarios.
- **Futura integración real** → conservar contratos estables y documentar que los adaptadores mock son sustituibles.

## Migration Plan

No hay migración de datos remota. La clave de persistencia será específica y versionada; si se modifica el modelo, el adaptador debe descartar snapshots incompatibles y restaurar fixtures seguros.

Rollback: restaurar el panel actual y retirar los adaptadores específicos sin afectar autenticación ni otras demos.

