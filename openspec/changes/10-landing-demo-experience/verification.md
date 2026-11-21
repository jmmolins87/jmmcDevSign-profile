# Verification Report: 10-landing-demo-experience

Fecha: 2026-11-20. Esquema: `spec-driven`. Rama: `spec-10-landing-demo-experience`. Fuente de verdad: propuesta, tres deltas, diseño y tareas leídos mediante `openspec status` e `openspec instructions apply --json`. Las evidencias corresponden a la implementación final del árbol de trabajo.

## Autorizaciones y punto de partida

- Spec `specs/10-landing-demo-experience.md` inicialmente `Approved`; invocación explícita de `spec-impl` y autorización del usuario para continuar con escritura habilitada.
- Planificación anterior guardada en `fbe8fb5`; implementación principal en `3dd7860`. Las correcciones posteriores se verifican en el árbol de trabajo, sin atribuirlas a ese commit.
- Context7 respondió `Monthly quota exceeded` en las resoluciones de Next.js y React. El usuario autorizó documentación oficial instalada y webs oficiales: Next.js 16.4.6 en `node_modules/next/dist/docs/`, React en `https://react.dev/reference/react`, Vitest en `https://vitest.dev/api/vi` y Playwright en `https://playwright.dev/docs/clock`.
- Línea base anterior a los cambios: `pnpm test` → **53 archivos / 211 tests PASS**, 40.44 s.
- Riesgo **alto** en regresión de autenticación, roles y transporte seguro de formularios; **medio** en rutas, persistencia y máquinas de estados mock. Se cubrieron casos positivos/negativos, almacenamiento bloqueado, relojes controlados y navegador real.
- Coordinación y contratos: `docs/discusiones/10-landing-demo-contracts.md`.

## Registro de fases

| Fase | Estado | Evidencia |
|---|---|---|
| Planificación anterior | Artefactos existentes; ejecución previa no auditada en esta sesión | Propuesta, tres capabilities, diseño y tareas persistidos |
| Preflight | EJECUTADO | Approved, autorización, permisos, rama y validación estricta |
| Apply | EJECUTADO | Especialistas reales con archivos delimitados; implementación y correcciones integradas |
| Testing | EJECUTADO | 262 tests unitarios/componentes y 236 E2E aprobados |
| OpenSpec Verify | EJECUTADO | Completitud, corrección y coherencia detalladas en este informe |
| Spec Verifier independiente | EJECUTADO — APPROVED | Informe contrastado; 33/33 criterios PASS; spec cerrada como Implemented por el verificador |
| Archivo | PENDIENTE | Requiere dictamen APPROVED y autorización final; no se ha sincronizado ni archivado |

## Quality gates ejecutados

| Comando real | Resultado final |
|---|---|
| `pnpm lint` | PASS, exit 0 |
| `pnpm typecheck` | PASS, exit 0 |
| `pnpm test` | PASS: **62 archivos / 262 tests**, 54.15 s; +9 archivos / +51 tests frente a la línea base |
| `pnpm build` | PASS; también ejecutado por el E2E final: Next.js 16.4.6, Webpack, compilación 5.2 s, tipos 3.1 s, 43/43 páginas |
| `pnpm test:e2e` | **236 passed (7.5m)**, exit 0; 59 por proyecto: Chromium desktop/mobile y Firefox desktop/mobile, 1440×900 y 375×812 |
| `openspec validate 10-landing-demo-experience --strict` | PASS: `Change '10-landing-demo-experience' is valid` |
| `git diff --check` | PASS |

La sesión de la ejecución completa final fue `84645`, con `exit_code: 0`. Playwright produjo además `{"status":"passed","failedTests":[]}`. Su log se leyó y se transcribió aquí antes de eliminarlo. Se conservaron comprobaciones de errores de navegador, geometría, progreso, snapshots inmóviles durante pausa, teclado y reduced motion. No se añadieron retries, skips ni ampliaciones de timeout para obtener verde.

## OpenSpec Verify — resultado

| Dimensión | Resultado |
|---|---|
| Completitud | PASS: **24/24 tareas**, **15/15 requisitos ADDED** implementados, sin requisitos sin correspondencia |
| Corrección | PASS: **15/15 requisitos**, **40/40 escenarios** con evidencia de código y pruebas/comprobación real |
| Coherencia | PASS: **6/6 decisiones** de diseño seguidas; estructura, tipos, imports, componentes y dominios coherentes con el proyecto |

No hay requisitos MODIFIED, REMOVED ni RENAMED en estos deltas. No se omitió ninguna comprobación aplicable. Los 15 requisitos ADDED se identifican por su título; los IDs de planificación `REQ-001`–`REQ-015` incluyen también límites mock y quality gates y se trazan por separado.

### Trazabilidad de las tareas

Los IDs `TASK-001`–`TASK-024` se derivan de las **24 casillas reales** de `tasks.md`, en orden: `TASK-001 = 1.1`, `TASK-024 = 6.4`. Esta correspondencia sustituye para la verificación la agrupación histórica de 16 TASK de la tabla de planificación, sin modificar requisitos aprobados. Los IDs TEST enlazan evidencias reales; ningún PASS deriva solo de una casilla.

| ID | Tarea | Requisitos | Test | Evidencia real | Dictamen Verify |
|---|---|---|---|---|---|
| TASK-001 | 1.1 | REQ-003, REQ-014 | TEST-001 | `tests/unit/public-locale.test.ts`; rutas ES/EN en E2E y /fr 404 en auditoría | VERIFY-PASS |
| TASK-002 | 1.2 | REQ-003 | TEST-002 | `tests/components/public-language.test.tsx`; catálogos; mensajes dinámicos y rol READER | VERIFY-PASS |
| TASK-003 | 1.3 | REQ-001 | TEST-003 | `e2e/landing-experience.spec.ts:4`; geometría nativa 375/1440 | VERIFY-PASS |
| TASK-004 | 1.4 | REQ-004, REQ-013 | TEST-004 | `landing-experience.spec.ts:4`, `auth-and-theme.spec.ts`, `login-modal.test.tsx` | VERIFY-PASS |
| TASK-005 | 2.1 | REQ-002, REQ-013 | TEST-005 | `theme-selector.test.tsx`; `landing-experience.spec.ts:35` | VERIFY-PASS |
| TASK-006 | 2.2 | REQ-005 | TEST-006 | `public-locale.test.ts:30`; `landing-experience.spec.ts:94`; cinco tramos en navegador | VERIFY-PASS |
| TASK-007 | 2.3 | REQ-001–REQ-005, REQ-013 | TEST-007 | `landing-experience.spec.ts`, cuatro proyectos aprobados | VERIFY-PASS |
| TASK-008 | 3.1 | REQ-006, REQ-014 | TEST-008 | `tests/unit/demo-playback.test.ts`, seis casos de reloj, carreras, idempotencia y error | VERIFY-PASS |
| TASK-009 | 3.2 | REQ-006 | TEST-009 | `demo-walkthroughs.test.tsx`; E2E de Agent Builder y Workflow | VERIFY-PASS |
| TASK-010 | 3.3 | REQ-006, REQ-012 | TEST-010 | `demo-experience-panels.test.tsx`; `demo-playback-controls.spec.ts` | VERIFY-PASS |
| TASK-011 | 3.4 | REQ-014 | TEST-011 | `app/lib/README.md`; lectura controller/hook/adaptadores y ausencia de servicios externos | VERIFY-PASS |
| TASK-012 | 4.1 | REQ-007 | TEST-012 | `workflow-layout-playback.test.ts`: límites, colisiones, IDs y snapshots | VERIFY-PASS |
| TASK-013 | 4.2 | REQ-007, REQ-013 | TEST-013 | `workflow-playback.spec.ts:42`; geometría DOM/SVG tras alineación, zoom y restauración | VERIFY-PASS |
| TASK-014 | 4.3 | REQ-008 | TEST-014 | `workflow-layout-playback.test.ts:47`: orden, eventos únicos y error | VERIFY-PASS |
| TASK-015 | 4.4 | REQ-008, REQ-013 | TEST-015 | `demo-walkthroughs.test.tsx`; E2E reduced motion; cleanup controller/hook | VERIFY-PASS |
| TASK-016 | 4.5 | REQ-007, REQ-008, REQ-013 | TEST-016 | `workflow-playback.spec.ts`, componentes y cuatro proyectos aprobados | VERIFY-PASS |
| TASK-017 | 5.1 | REQ-010, REQ-012 | TEST-017 | `demo-experience-panels.test.tsx:29`; `demo-experience-corrections.spec.ts:4` | VERIFY-PASS |
| TASK-018 | 5.2 | REQ-009, REQ-012 | TEST-018 | `demo-experience-panels.test.tsx:57`; `orders-realtime.spec.ts`; playback transversal | VERIFY-PASS |
| TASK-019 | 5.3 | REQ-011, REQ-013 | TEST-019 | `demo-experience-corrections.spec.ts:18`; foco, pedido/cliente, filtro y página | VERIFY-PASS |
| TASK-020 | 5.4 | REQ-012, REQ-013 | TEST-020 | Catálogos/paneles; búsqueda vacía recuperable; auditoría de las cinco demos ES/EN | VERIFY-PASS |
| TASK-021 | 6.1 | REQ-002, REQ-006–REQ-013 | TEST-021 | Suite completa: 62 archivos / 262 PASS frente a 53/211 iniciales | VERIFY-PASS |
| TASK-022 | 6.2 | REQ-001–REQ-013 | TEST-022 | E2E completo: 236 PASS, Chromium/Firefox, 375/1440, ES/EN | VERIFY-PASS |
| TASK-023 | 6.3 | REQ-015 | TEST-023 | Todos los comandos reales de quality gates de este informe aprobados | VERIFY-PASS |
| TASK-024 | 6.4 | REQ-015 | TEST-024 | Matrices completas, riesgos, temporales eliminados y puertos propios sin listeners | VERIFY-PASS |

Los archivos `*.spec.ts` están en `e2e/`; los tests abreviados están en `tests/unit/` o `tests/components/` según los archivos concretos enumerados por el proyecto.

### Requisitos y escenarios de los deltas

Las rutas de implementación bajo `demos/` corresponden a `app/[locale]/demos/`; `_components/`, a `app/[locale]/_components/`. Se conservan los títulos exactos de escenarios para cotejarlos con OpenSpec. Cada fila verifica todos los escenarios enumerados.

| Capability / requisito | Escenarios comprobados | Implementación | Evidencia y resultado |
|---|---|---|---|
| localization / English public routes | Open English landing; Open English demo; Open English authentication (3) | `app/[locale]/layout.tsx:6`, locale provider, páginas compartidas y catálogos | `public-locale.test.ts`, `public-language.test.tsx`, E2E y 20 rutas nativas. VERIFY-PASS |
| localization / Equivalent language switching | Switch landing language; Switch demo language; Switch authentication language (3) | `app/lib/i18n.ts:9`, `_components/language-selector.tsx:11`, `login/auth-locale-handoff.ts` | `public-language.test.tsx:16`, `auth-locale-handoff.test.ts`, `landing-experience.spec.ts:52` y `:64`; recorrido nativo ES→EN→ES. VERIFY-PASS |
| localization / Complete translated interface | No untranslated interface copy; Unknown locale (2) | `app/lib/public-messages.ts`, catálogos de demos/auth, guard isLocale/notFound del layout | Diccionarios, READER sin cambiar enum LECTOR, mensajes dinámicos; /fr 404 limpio. VERIFY-PASS |
| landing-experience / Header aligned with the content container | Header alignment on desktop; Header alignment on mobile (2) | `_components/landing-shell.tsx`, `_components/surface-header.tsx`, contenedor compartido | `landing-experience.spec.ts:4`; extremos 48/1392 a 1440 y 16/359 a 375. VERIFY-PASS |
| landing-experience / Reactive theme selection | Select explicit theme; Follow operating system theme; Theme storage unavailable (3) | `_components/theme-selector.tsx:17`, matchMedia, almacenamiento protegido | `theme-selector.test.tsx:9` y `:25`, `landing-experience.spec.ts:35`; iconos/aria/tooltip y reload. VERIFY-PASS |
| landing-experience / Functional membership entry | Open membership modal from header; Open membership modal from menu; Close membership modal (3) | SiteShell, `app/[locale]/@modal/(.)login/page.tsx`, `login/login-modal.tsx:58` | Header, menú, historial, ruta directa, cierre y foco en ES/EN a ambos anchos; `login-modal.test.tsx`. VERIFY-PASS |
| landing-experience / Stable sticky demo presentation | Scroll through a demo segment; Advance to next demo; Reduced motion sticky behavior (3) | `_components/demo-scroll.ts:1`, landing-demos y landing-scroll | `public-locale.test.ts:30`, `landing-experience.spec.ts:94`; cinco índices estables en offsets 20/320/920/1820/2720/3620. VERIFY-PASS |
| demo-automation / Deterministic demo playback | Start playback; Pause and resume playback; Reset playback; Reduced motion playback (4) | `app/lib/demo-playback.ts:32`, hook y controles comunes, cinco adaptadores independientes | Unitarios, componentes y E2E de playback/workflow; pausa exacta, reset, teclado y reduced motion. VERIFY-PASS |
| demo-automation / Collision-free workflow canvas | Initial workflow layout; Auto-align workflow; Restore workflow snapshot (3) | `demos/leads-workflow/domain/workflow-layout.ts:4`, workflow-repository:128, workflow-panel:90 | `workflow-layout-playback.test.ts:9`, `:19`, `:28`, `:40`; `workflow-playback.spec.ts:42`; cinco nodos, cero colisiones, cuatro aristas con error nativo máximo 0 px. VERIFY-PASS |
| demo-automation / Sequential workflow execution animation | Execute workflow path; Workflow execution completion; Workflow execution error (3) | `demos/leads-workflow/domain/workflow-runtime.ts:68`, workflow-panel:252 y estilos reduced motion | Unitarios de orden/error; `workflow-playback.spec.ts:56` y `:84`; WEBHOOK→IA→CRM→EMAIL→SLACK, traza única y error IA detiene al 20%. VERIFY-PASS |
| demo-automation / Automated order progression | Incoming order; Kitchen progression; Pause order simulation (3) | `demos/orders-realtime/orders-panel.tsx:132`, servicios de dominio existentes | `demo-experience-panels.test.tsx:57`, `orders-realtime.spec.ts:9`, snapshot idéntico tras 5 s de pausa; dos pedidos/ciclo completo sin duplicados. VERIFY-PASS |
| demo-automation / Lead qualification skeleton lifecycle | Qualification load completes; Qualification scenario changes (2) | `demos/lead-qualification/qualification-panel.tsx:332`, timer de 650 ms con cancelación y recuperación | `demo-experience-panels.test.tsx:29`, `demo-experience-corrections.spec.ts:4`; carga, cambio/reset y recuperación ES/EN. VERIFY-PASS |
| demo-automation / Business backoffice view action | Open order dossier; Close order dossier (2) | `demos/business-backoffice/backoffice-panel.tsx:42` y `:157`, drawer compartido | `demo-experience-panels.test.tsx:82`, `demo-experience-corrections.spec.ts:18`; pedido/cliente, Escape, foco, filtro y página 2 intactos. VERIFY-PASS |
| demo-automation / Visual interaction feedback | Successful demo action; Empty or error state (2) | Controles comunes, catálogos y estados de cada panel; búsqueda Backoffice recuperable | Suites de las cinco demos, E2E de correcciones/workflow/operaciones; revisión de métricas, vacíos, errores y regiones vivas. VERIFY-PASS |
| demo-automation / Responsive and accessible demo behavior | Mobile demo interaction; Keyboard demo interaction (2) | Controles semánticos, drawer/modal, estilos responsive y reduced motion | `demo-playback-controls.spec.ts`, `workflow-playback.spec.ts`, `runtime-accessibility.spec.ts`; 20 rutas y ocho recorridos nativos adicionales. VERIFY-PASS |

Total: localization **3 requisitos / 8 escenarios**, landing-experience **4 / 11**, demo-automation **8 / 21**; **15 / 40**, sin huecos de cobertura.

### Coherencia con el diseño

| Decisión | Correspondencia comprobada |
|---|---|
| 1. Locale compartido | Un único árbol app/[locale], provider y diccionarios tipados; /es y /en comparten componentes y enlaces equivalentes |
| 2. Tema dark/light/system | Preferencia local protegida, matchMedia reactivo, una selección accesible y cleanup de listeners |
| 3. Reproductor común | Contrato aprobado intacto; callbacks por dominio, reloj inyectable, pausa con tiempo restante, reset espera mutación en curso y cleanup al desmontar |
| 4. Layout workflow | Nodos 250×240, separación mínima 32, canvas 1400 con altura calculada; validación de IDs/límites/colisiones y reparación de snapshots |
| 5. Ejecución secuencial | Orden del grafo, evento por nodo, estados activo/final/error; presentación SVG y reduced motion mantienen traza y estados |
| 6. Orders y drawer | Operaciones de pedidos existentes; VER conserva pedido/cliente y drawer con foco, filtros y paginación |

Consistencia comprobada: nombres en inglés, TypeScript tipado, alias `@`, separación de dominio/presentación y repositorios/fixtures propios. Las páginas servidor conservan el límite cliente de controles y estado. `package.json` y `pnpm-lock.yaml` no difieren respecto a fbe8fb5; los contratos/adaptadores nuevos no añaden HTTP, WebSocket, SSE, IA remota ni almacenamiento de credenciales.

## Correcciones y evidencia histórica

- La primera build detectó IncompatibleParallelRouteSlotsError; se añadió el fallback default.tsx de la estructura de rutas, conservando la validación estricta. La build final pasa.
- Un primer E2E no pudo escuchar en 3099 (EPERM del sandbox); se repitió con permisos adecuados. No se contó como fallo de aplicación.
- Se acotaron queries status/alert al diálogo/reproductor porque fondo y anunciador de rutas contienen regiones legítimas adicionales. Focal: 3 FAIL→3 PASS, mismas aserciones.
- Backoffice: búsqueda sin coincidencias reproducida ES/EN y corregida con estado explicativo/limpiar; regresiones 17 PASS. Se restauró el enlace editorial /[locale]/blog/editor.
- Auth: navegación nativa al cambiar idioma evita slots duplicados. Handoff versionado de un solo uso, allowlist de vista/nombre/email/rol; nunca passwords/tokens. Se vacían passwords antes de navegar. Regresión de contraseña RED→GREEN; pruebas negativas de campos, roles, corrupción y storage bloqueado.
- Firefox SIG11 aislado en toHaveJSProperty sobre el progreso de la aplicación, con/sin reloj. Se usa atributo nativo value y max=100 manteniendo valores, pausa, snapshot, teclado, final/reset. Focal Firefox PASS; control negativo 26 esperado frente a 25 real FAIL, luego retirado. Sin cambios de configuración, vídeo, retries o timeouts.
- Primera pasada completa recuperable: **232 PASS / 4 FAIL**, 11.5 min. Dos cierres directos Chromium iban a about:blank; se distingue origen interceptado (back) de directo (replace al portfolio del locale). Regresiones ES/EN RED→GREEN. Otros dos casos esperaban networkidle en un artículo ya renderizado, con HTTP 200/SEO a 693 ms; se espera domcontentloaded conservando HTTP, contenido, SEO y 404 draft.
- Auditoría independiente detectó etiqueta LECTOR en inglés. Se tradujo a READER en botón/perfil, conservando enum, persistencia y permisos LECTOR. Regresión accesible/permisos RED→GREEN. Correcciones focales: 39 PASS. Se retiró una opción RTL exact no admitida por getByRole, conservando aserciones; typecheck y focal Backoffice aprobados.
- Segunda pasada: **235 PASS / 1 FAIL**, 8.2 min. El test de idioma consultaba isVisible antes de estar listo el banner y elegía menú móvil en desktop. Se añadió solo la espera del banner; focal cuatro proyectos 4 PASS. Una simulación artificial retrasando JS no reprodujo el fallo y no se presenta como RED. La pasada posterior terminó **236 PASS**, 7.5 min, exit 0.
- Los avisos preliminares de foco e hidratación quedaron corregidos o no se reprodujeron en la build estable; recorridos nativos y aserciones pageerror finales pasan.

## Auditoría independiente realizada

El agente `final_audit_resume`, ajeno a los cambios de producción, conserva evidencia propia de **33 tests / 7 archivos** y **23 tests / 3 archivos** aprobados, validación estricta y Chrome real:

- Veinte combinaciones de cinco demos × ES/EN × 375/1440, sin overflow involuntario.
- Ocho recorridos adicionales de teclado/reduced motion completan 100%, reinician a 0% y mantienen snapshots inmóviles durante 5 s de pausa; workflow comprobado por separado ES/EN.
- Workflow inicial, alineación, zoom, reset/restauración en ambos locales/anchos: cinco nodos, cero colisiones, cuatro aristas con error máximo 0 px.
- Header/menú, membresía, contexto preservado, cierre/Atrás y foco; tres iconos/estados de tema, OS reactivo, preferencia explícita/reload y cinco segmentos sticky.
- Auth ES→EN→ES con campos seguros, passwords vacíos, un diálogo, handoff consumido. Cierre directo y READER/permisos comprobados sobre build final a ambos anchos.
- Skeletons, errores/vacíos y drawer con cliente/pedido, Escape/foco, filtro/página; /fr 404.

Dictamen independiente final del 2026-11-20: **APPROVED**, **33/33 criterios PASS**, ninguno pendiente y ningún hallazgo de producto abierto. El verificador contrastó este informe, las 24 tareas, los 15 requisitos, los 40 escenarios, las seis decisiones y la salida final de E2E; ejecutó de nuevo validación estricta y diff check con resultado PASS. Su única escritura fue cerrar la spec como **Implemented**, marcar los 33 criterios y añadir una nota de verificación. No modificó código ni artefactos OpenSpec.

## Riesgos residuales y limpieza

- LOW: aviso existente de Vite sobre configuración nativa futura; no afecta gates ni criterios. No se cambia configuración fuera de alcance.
- El alcance sigue siendo mock local. Si sessionStorage está bloqueado, el cambio de idioma de auth continúa con formulario vacío, fallback seguro documentado en `app/[locale]/login/README.md`.
- Capturas/snapshots/logs temporales de `.playwright-mcp` revisados y eliminados; también `test-results`, `test-results-resume` y `test-results-resume-firefox`. El resultado final se transcribió antes de borrar. No quedan pruebas de mutación temporales.
- Playwright detuvo su servidor 3099; auditoría 3107 detenido. lsof final no muestra listeners en 3099/3107. Servidor preexistente de otra sesión intacto; Chrome de auditoría cerrado.

**Hallazgos de Verify:** 0 CRITICAL, 0 WARNING, 0 SUGGESTION; ninguna comprobación aplicable omitida. **Resultado: PASS** en completitud, corrección y coherencia. **Spec Verifier: APPROVED**. Estado del flujo: **AWAITING_ARCHIVE_APPROVAL**; sincronizar y archivar quedan pendientes de autorización final explícita del usuario.
