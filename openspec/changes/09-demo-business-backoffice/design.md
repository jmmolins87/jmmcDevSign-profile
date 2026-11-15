# Design

## Context

La ruta actual reutiliza repositorios genéricos y un `BackofficePanel` reducido. La nueva capability necesita una frontera local propia para un workspace compuesto por pedidos, clientes, facturas, stock, métricas, simulación y auditoría, sin acoplarla a React ni a proveedores externos. La motivación y el alcance están en `proposal.md`; el comportamiento normativo está en `specs/business-backoffice/spec.md`.

## Goals / Non-Goals

**Goals:**

- Organizar el dominio Business Backoffice en módulos independientes de la UI.
- Mantener un único workspace actualizado mediante operaciones validadas y deterministas.
- Reutilizar los tokens y primitivas UI existentes sin introducir dependencias nuevas.
- Hacer explícitos los límites de autorización, persistencia, exportación y simulación.
- Permitir tests unitarios del dominio, tests de componentes de la composición y E2E de la ruta sin red ni reloj real.

**Non-Goals:**

- No crear una API HTTP, repositorio remoto, autenticación real, RLS, migraciones ni sincronización multiusuario.
- No modificar el comportamiento de las demás demos ni compartir fixtures con ellas.
- No convertir la gráfica en una visualización interactiva compleja ni añadir una librería de gráficos.

## Decisions

### 1. Separar dominio, adaptador y composición

Se creará una carpeta `app/es/demos/business-backoffice/domain/` con tipos, constantes, fixtures, validadores, política de permisos, repositorio, runtime y exportador CSV. `backoffice-panel.tsx` consumirá el runtime y sus estados, pero no leerá fixtures ni `localStorage` directamente.

**Razón:** permite sustituir el adaptador local por uno remoto sin cambiar la composición ni las reglas de negocio, y hace que las reglas críticas puedan probarse sin navegador.

**Alternativas consideradas:** mantener la lógica en el panel actual, descartado por acoplamiento y dificultad para cubrir persistencia, roles y estados; reutilizar los repositorios genéricos existentes, descartado porque sus modelos no representan el workspace de esta demo.

### 2. Runtime con operaciones asíncronas y actualizaciones completas

El runtime mantendrá el workspace en memoria, expondrá las operaciones definidas por la spec y delegará la persistencia en el repositorio. Cada operación validará entradas, comprobará permisos, derivará métricas o estados necesarios, añadirá auditoría cuando corresponda y devolverá el workspace resultante.

**Razón:** centraliza las invariantes y evita condiciones de rol dispersas en componentes. Las promesas conservan una frontera compatible con una futura fuente remota aunque el adaptador actual sea local.

**Alternativas consideradas:** mutar estado desde handlers React, descartado por duplicación y riesgo de inconsistencias; usar un gestor global nuevo, descartado por la restricción de no añadir dependencias.

### 3. Snapshot versionado con recuperación segura

El repositorio utilizará una clave local específica de la demo y un snapshot con `version: 1`. La lectura seguirá este orden: parseo, validación estructural y de dominio, aceptación del snapshot; ante cualquier fallo se cargarán fixtures seguros y se devolverá feedback no bloqueante. Si el almacenamiento no está disponible, se conservará una copia en memoria y se comunicará la limitación.

**Razón:** evita que datos corruptos o cambios de schema rompan la demo y mantiene el comportamiento determinista.

**Alternativas consideradas:** guardar cada colección por separado, descartado por riesgo de snapshots parciales; aceptar JSON sin validar, descartado por permitir IDs duplicados, importes inválidos o estados imposibles.

### 4. Estado de simulación explícito

`simulationState` será parte del workspace y tendrá los seis valores de la spec. El panel derivará visibilidad, drawer, banner, toast, esqueletos y tabla vacía de ese estado. Volver a `live` cerrará overlays temporales y conservará las mutaciones del workspace.

**Razón:** hace los estados reproducibles desde el simulador y permite comprobarlos en E2E sin esperar eventos temporales.

**Alternativas consideradas:** controlar cada estado con booleanos independientes, descartado por combinaciones inválidas y restauración ambigua.

### 5. CSV determinista y descarga en el borde del navegador

El exportador recibirá únicamente el conjunto de pedidos filtrado, producirá una cabecera fija y aplicará escaping compatible con CSV para comas, comillas y saltos de línea. Solo el método `download` conocerá `Blob`, `URL` y el elemento de descarga; el formateo será testeable sin DOM.

**Razón:** mantiene la lógica portable y limita el acceso a APIs del navegador a un borde pequeño.

**Alternativas consideradas:** construir CSV en el componente, descartado por acoplar escaping y descarga a la UI; usar una dependencia externa, descartado por alcance y restricciones.

### 6. Composición visual por bandas y módulos de workspace

El panel se organizará en bandas independientes: simulador/roles, controles de búsqueda y periodo, sidebar, canvas de métricas y gráfica, ledger de pedidos, drawer y bloques de facturas, stock y auditoría. La composición usará las primitivas existentes cuando encajen y estilos locales para conservar densidad, hairlines y responsive sin alterar tokens globales innecesariamente.

**Razón:** refleja la jerarquía de `code.html`, permite ocultar o reorganizar contenido en móvil y mantiene componentes pequeños con responsabilidad clara.

**Alternativas consideradas:** incrustar la referencia HTML completa, descartado por perder tipado, accesibilidad y contratos de React; convertir toda la vista en una tabla única, descartado por no conservar la jerarquía visual.

### 7. Accesibilidad y movimiento como restricciones de composición

El drawer reutilizará la primitiva accesible existente o su patrón de foco, con control de origen, `Escape` y foco visible. Los mensajes de error, bloqueo, persistencia y toast usarán regiones vivas. Las transiciones se limitarán a propiedades no estructurales y se desactivarán o suavizarán con `prefers-reduced-motion`.

**Razón:** teclado, foco y feedback forman parte del contrato funcional, no son un acabado posterior.

**Alternativas consideradas:** añadir una librería de componentes o motion, descartado por no añadir dependencias y por existir primitivas locales suficientes.

## Risks / Trade-offs

- [La referencia es muy densa en escritorio] → Mantener el canvas con `min-width: 0`, dividir por bandas y verificar capturas a 1440px y 375px antes de cerrar.
- [Los fixtures contienen muchas colecciones relacionadas] → Validar IDs únicos, referencias de cliente y estados antes de aceptar snapshots.
- [El snapshot puede quedar obsoleto durante desarrollo] → Rechazar versiones distintas y recuperar fixtures seguros, documentando el cambio de versión en el adaptador.
- [Una política centralizada puede ocultar un permiso en una acción nueva] → Cubrir cada mutación y cada rol con tests de dominio y escenarios E2E de lector.
- [El drawer puede introducir scroll o foco incorrecto en móvil] → Reutilizar el patrón de drawer existente y verificar apertura, cierre, `Escape`, foco y overflow en ambos viewports.
- [La descarga CSV puede tener diferencias entre navegadores] → Separar creación de contenido y descarga, probar el contenido exacto y comprobar la descarga en Playwright.
- [La gráfica SVG puede romperse con series incompletas] → Validar la serie y usar un estado vacío determinista antes de calcular coordenadas.

## Migration Plan

1. Crear los módulos de dominio y fixtures sin cambiar todavía la ruta pública.
2. Añadir repositorio, runtime, snapshot y exportador con tests unitarios.
3. Sustituir la composición del panel y conectar los estados del workspace.
4. Añadir pruebas de componentes y ampliar la suite E2E de la demo.
5. Ejecutar lint, typecheck, tests, build, E2E y validación estricta de OpenSpec.

El rollback local consiste en revertir el cambio de la ruta y los módulos de la capability; no hay migraciones remotas ni cambios de infraestructura. Los snapshots incompatibles se descartan mediante la validación de versión y vuelven a fixtures seguros.

## Open Questions

No quedan preguntas abiertas que cambien la spec, la arquitectura o el desglose de tareas.
