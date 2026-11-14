# Tasks

## 1. Dominio y contratos

- [x] TASK-001 Crear tipos, estados, presets, fixtures y contratos de leads workflow; verificar con tests unitarios de tipos, fixtures y validación (`pnpm test -- tests/unit/leads-workflow-domain.test.ts`).
- [x] TASK-002 Implementar validadores de workflow y filtros, incluidos nodos requeridos y conexiones válidas; verificar casos válidos, inválidos y resultado vacío (`pnpm test -- tests/unit/leads-workflow-domain.test.ts`).
- [x] TASK-003 Implementar repositorio mock en memoria con operaciones de workflow, leads, eventos y alta/reset de nodos; verificar contrato aislado de React (`pnpm test -- tests/unit/leads-workflow-repository.test.ts`).

## 2. Persistencia y runtime

- [x] TASK-004 Añadir snapshot versionado de `localStorage`, validación de esquema, fallback seguro y reset de workspace; verificar recarga, corrupción e incompatibilidad (`pnpm test -- tests/unit/leads-workflow-repository.test.ts`).
- [x] TASK-005 Implementar runtime mock para presets, simulación de disparo, ejecución de test, trazas y transiciones deterministas; verificar lead actualizado, eventos y latencias (`pnpm test -- tests/unit/leads-workflow-runtime.test.ts`).
- [x] TASK-006 Implementar servicio de despliegue mock con validación, versión local y auditoría; verificar despliegue válido e inválido (`pnpm test -- tests/unit/leads-workflow-deployment.test.ts`).

## 3. Shell y canvas

- [x] TASK-007 Sustituir el panel actual por el shell completo con header, command bar, telemetría, presets, HUD, canvas y footer; verificar render sin errores y estructura principal (`pnpm exec vitest run tests/components/leads-workflow-panel.test.tsx`: 8/8).
- [x] TASK-008 Implementar nodos, conexiones, metadata técnica, estados visuales, zoom, `RESET GRID`, `AUTO-ALIGN` y alta de nodos fixture; verificar acciones y posiciones deterministas (`pnpm exec vitest run tests/components/leads-workflow-panel.test.tsx`: 8/8; `pnpm typecheck`: OK).

## 4. Registro y acciones

- [x] TASK-009 Implementar registro con cuatro leads, filtros combinables por estado/score/origen, detalle, estado vacío y persistencia de filtros; verificar resultados y recuperación (`pnpm exec vitest run tests/components/leads-workflow-panel.test.tsx`: 8/8).
- [x] TASK-010 Implementar drawer móvil accesible con canvas-first, retorno de foco, cierre por `Escape` y controles de teclado; verificar foco y estados a 375px (`pnpm exec playwright test e2e/demo-flows.spec.ts`: proyecto `chromium-mobile` y `firefox-mobile` OK).
- [x] TASK-011 Conectar simulación, ejecución de test, feedback `aria-live`, errores y recuperación en el panel; verificar interacción completa y ausencia de llamadas de red (`pnpm exec vitest run tests/components/leads-workflow-panel.test.tsx`: 8/8; `rg` de límites de red sin coincidencias).
- [x] TASK-012 Conectar validación y despliegue mock con confirmación accesible y versión local; verificar estados válido e inválido (`pnpm exec vitest run tests/unit/leads-workflow-deployment.test.ts`: OK; `pnpm exec playwright test e2e/demo-flows.spec.ts`: 8/8).

## 5. Verificación visual e integración

- [x] TASK-013 Actualizar o crear el flujo E2E de la demo para 375px y 1440px, teclado, drawer, presets, acciones, filtros y despliegue; verificar con `pnpm exec playwright test e2e/demo-flows.spec.ts`: 8/8 en los cuatro proyectos (375px y 1440px). La suite global `pnpm test:e2e` alcanzó 70 tests verdes antes de que el servidor `next start` rechazara conexiones; además quedan dos fallos ajenos de `e2e/auth-and-theme.spec.ts` por un locator ambiguo de la landing.
- [x] TASK-014 Ejecutar lint, typecheck, tests, build y validación estricta de OpenSpec; verificar `pnpm lint` (OK), `pnpm typecheck` (OK), `pnpm test` (40 archivos / 148 tests OK), `pnpm build` (OK) y `openspec validate 06-demo-leads-workflow --type change --strict` (válido).
- [x] TASK-015 Documentar la frontera futura de producción y los mocks deterministas en el módulo de dominio; verificar que no existan llamadas de red, secretos, migraciones ni dependencias nuevas (`rg -n "fetch|axios|supabase|process\.env" app/es/demos/leads-workflow`: sin coincidencias).

## Workflow follow-up

- Ejecutar `openspec verify 06-demo-leads-workflow` y la auditoría independiente de `spec-verifier`.
- Sincronizar y archivar únicamente después de Verify aprobado, Spec Verifier aprobado y autorización final del usuario.
