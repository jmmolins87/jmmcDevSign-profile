# Tasks

## 1. Dominio y contratos

- [x] 1.1 Crear tipos, estados, constantes, fixtures, contratos y validadores del dominio Orders Realtime; verificar que los fixtures contienen los seis pedidos de referencia, el carrito inicial y los KPIs aprobados mediante `pnpm test -- --run` (45 archivos, 169 tests).
- [x] 1.2 Implementar las reglas de importes, ids, estados permitidos y transiciones KDS; verificar cantidades no negativas, IVA del 10%, estados válidos e idempotencia inicial con `pnpm typecheck` y `tests/unit/orders-realtime-domain.test.ts`.

## 2. Repositorio persistente

- [x] 2.1 Implementar el repositorio mock con snapshot versionado, lectura/escritura, actualización parcial, eventos y reset; verificar restauración válida y persistencia de pedidos, carrito, KPIs, conexión, escenario y eventos con `pnpm exec vitest run tests/unit/orders-realtime-repository.test.ts` (1 archivo, 5 tests).
- [x] 2.2 Implementar validación de snapshot, recuperación de fixtures seguros y fallback en memoria ante datos corruptos, incompatibles o almacenamiento no disponible; verificar los tres casos con `pnpm exec vitest run tests/unit/orders-realtime-repository.test.ts` y `pnpm typecheck` (OK).

## 3. Transporte y runtime mock

- [x] 3.1 Implementar el transporte realtime local con consulta/cambio de conexión, publicación, suscripción y estados deterministas; verificar entrega a suscriptores, desconexión y ausencia de red con `pnpm exec vitest run tests/unit/orders-realtime-transport.test.ts` (1 archivo, 3 tests).
- [x] 3.2 Implementar el runtime para carrito, emisión, transiciones KDS, entrega, archivado y estado del cliente; verificar el flujo completo, ids únicos, eventos no duplicados y progreso reproducible con `pnpm exec vitest run tests/unit/orders-realtime-runtime.test.ts` (1 archivo, 5 tests) y `pnpm typecheck` (OK).
- [x] 3.3 Implementar los cuatro escenarios de conexión y workspace; verificar estados, latencias, pedidos y eventos deterministas con `pnpm exec vitest run tests/unit/orders-realtime-runtime.test.ts tests/components/orders-realtime-panel.test.tsx` (2 archivos, 12 tests).

## 4. Stream de eventos

- [x] 4.1 Implementar buffer de eventos con límite de 40, pausa/reanudación, limpieza, filtro por identificador y mensaje de reinicio; verificar límite, filtro, pausa y limpieza con `pnpm exec vitest run tests/unit/orders-realtime-repository.test.ts tests/unit/orders-realtime-runtime.test.ts` (2 archivos, 11 tests).
- [x] 4.2 Integrar el stream con el runtime y el repositorio sin añadir eventos automáticos mientras está pausado; verificar que las operaciones de negocio siguen actualizando el workspace y muestran feedback visible con `pnpm exec vitest run tests/unit/orders-realtime-runtime.test.ts tests/components/orders-realtime-panel.test.tsx` (12 tests relacionados).

## 5. Shell visual y navegación

- [x] 5.1 Sustituir el panel actual por el shell de referencia reutilizando tokens y primitivas existentes; verificar tema oscuro, tipografías, hairlines, geometría cuadrada, densidad y acento naranja con captura y test de componentes (captura Playwright integrada de la ruta, `tests/components/orders-realtime-panel.test.tsx`, 6 tests).
- [x] 5.2 Implementar navegación técnica, conexión, simulador, rail de cuatro KPIs, sparkline estático y footer operativo; verificar la presencia de todas las regiones y los cuatro escenarios con test de componentes (snapshot Playwright integrado y test de componentes; los cuatro botones de escenario aparecen y son seleccionables).

## 6. Cliente, KDS y estados

- [x] 6.1 Implementar el panel `BRUTAL BURGER` con teléfono mock, estado realtime, productos, cantidades, subtotal, IVA, total y `ENVIAR PEDIDO [ PEDIR ↵ ]`; verificar cantidades, importes, emisión y feedback accesible con `pnpm exec vitest run tests/components/orders-realtime-panel.test.tsx` (6 tests).
- [x] 6.2 Implementar el separador full-duplex y el tablero KDS con columnas `NUEVO`, `EN PLANCHA` y `LISTO`, tarjetas, acciones y entrega/archivado; verificar transiciones e idempotencia con `pnpm exec vitest run tests/unit/orders-realtime-runtime.test.ts tests/components/orders-realtime-panel.test.tsx` (11 tests relacionados).
- [x] 6.3 Implementar terminal de eventos, estados vacío/offline/reconectando, feedback `aria-live` y buffer reiniciado; verificar nombres accesibles, mensajes y controles con `pnpm exec vitest run tests/components/orders-realtime-panel.test.tsx` (6 tests).

## 7. Responsive, teclado y documentación

- [x] 7.1 Implementar las pestañas móviles `{ CLIENTE } // ORDEN` y `{ COCINA } // KDS`, scroll, foco, teclado y `prefers-reduced-motion`; verificar 375px y 1440px sin overflow horizontal con Playwright y media feature de movimiento reducido (sesión Playwright integrada: `scrollWidth === 375` en móvil, tabs alternas, foco + `Enter` en emisión, `matchMedia(reduce)`, `scrollBehavior: auto`; snapshot desktop a 967px del viewport integrado).
- [x] 7.2 Documentar la frontera futura de producción, los contratos mock, el snapshot y los límites de la demo sin introducir integraciones remotas; verificar que la documentación coincide con la implementación y no contiene proveedores activos (`app/es/demos/orders-realtime/domain/README.md`).

## 8. Quality gates e integración

- [x] 8.1 Actualizar el flujo E2E de Orders Realtime y verificar emisión, KDS, conexión, escenarios, stream, recuperación de snapshot, teclado y pestañas móviles en Chromium y Firefox a 375px y 1440px (`pnpm exec playwright test e2e/orders-realtime.spec.ts`: 12 passed en los cuatro proyectos).
- [x] 8.2 Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` y `openspec validate 08-demo-orders-realtime --strict`; registrar la salida real y corregir cualquier fallo sin desactivar pruebas (`pnpm lint` OK, `pnpm typecheck` OK, `pnpm test -- --run`: 49 archivos/189 tests OK, `pnpm build` OK, `pnpm test:e2e`: 132 passed en 7.3m, `openspec validate ... --strict`: valid). La suite E2E mostró avisos no bloqueantes de `NO_COLOR`/`FORCE_COLOR` y Vitest mostró su warning conocido de `configLoader: native`.

## Workflow follow-up

- Ejecutar `openspec-verify-change` y la revisión independiente de `spec-verifier`.
- Sincronizar las especificaciones cuando corresponda.
- Archivar el cambio solo después de Verify superado, dictamen `APPROVED`, riesgos residuales documentados y autorización final explícita del usuario.
