# Tasks

## 1. Dominio y fixtures

- [x] 1.1 Crear `domain/backoffice-types.ts`, constantes de estados, roles, permisos y contratos; verificar que `pnpm typecheck` detecta los tipos sin `any` innecesario. (REQ-001, REQ-005, REQ-006, REQ-007, REQ-008, REQ-009, REQ-011) — Verificado con `pnpm typecheck`.
- [x] 1.2 Crear fixtures iniciales de métricas, series, pedidos, clientes, facturas, stock y auditoría con IDs únicos y valores de referencia; verificar con tests unitarios los valores iniciales y las relaciones de cliente. (REQ-002) — Verificado con `business-backoffice-domain.test.ts`.
- [x] 1.3 Implementar validadores de workspace, importes, IDs, pedidos manuales, emails, stock y búsquedas normalizadas; verificar casos válidos, inválidos, acentos y estados incompatibles con Vitest. (REQ-003, REQ-005, REQ-007, REQ-009, REQ-011) — Verificado con la suite Vitest: 50 archivos y 197 tests pasados.

## 2. Repositorio y persistencia

- [x] 2.1 Implementar el repositorio local con snapshot `version: 1`, lectura/escritura segura y fallback en memoria sin acceder a React; verificar persistencia, restauración y operación sin `localStorage`. (REQ-011, REQ-012) — Verificado con tests de persistencia y fallback.
- [x] 2.2 Implementar recuperación ante JSON ilegible, versión incompatible, estructura inválida, IDs duplicados o importes inválidos; verificar que se cargan fixtures seguros y se emite feedback no bloqueante. (REQ-011) — Verificado con snapshots corruptos e incompatibles.
- [x] 2.3 Añadir tests unitarios de repositorio para snapshot válido, corrupción, incompatibilidad y almacenamiento no disponible; verificar la suite del dominio con `pnpm test -- tests/unit/business-backoffice-repository.test.ts`. (REQ-011) — Verificado: 51 archivos y 200 tests pasados.

## 3. Runtime, permisos y operaciones

- [x] 3.1 Implementar la política reutilizable de permisos para `ADMIN`, `EDITOR` y `LECTOR`; verificar cada permiso y que una mutación bloqueada no modifica el workspace. (REQ-004) — Verificado con tests de permisos y bloqueo de lector.
- [x] 3.2 Implementar runtime para rol, simulación, periodo, búsqueda, paginación y selección de cliente; verificar estados reproducibles y página válida después de filtrar. (REQ-003, REQ-004, REQ-010) — Verificado con tests de runtime.
- [x] 3.3 Implementar creación de pedido manual, derivación determinista de métricas y auditoría; verificar validación positiva/negativa y evento único. (REQ-005, REQ-010) — Verificado con creación de `#ORD-9043` y auditoría.
- [x] 3.4 Implementar emisión idempotente de facturas, edición de clientes y actualización de stock con recalculo de severidad; verificar permisos, cancelación, cantidades negativas e idempotencia. (REQ-007, REQ-008, REQ-009) — Verificado con factura `FAC-2025-089` y stock `JARRON-RAW-05`.
- [x] 3.5 Implementar exportador CSV con cabecera estable, escaping de comas, comillas y saltos de línea, y descarga aislada en el borde del navegador; verificar el contenido exacto y el conjunto filtrado. (REQ-006) — Verificado con exportación filtrada y cabecera estable.
- [x] 3.6 Añadir tests unitarios del runtime para roles, búsqueda, paginación, pedido manual, facturas, stock, auditoría y simulador; verificar la ejecución completa de los tests de dominio. (REQ-003, REQ-004, REQ-005, REQ-007, REQ-008, REQ-009, REQ-010) — Verificado: 52 archivos y 206 tests pasados.

## 4. Composición visual del backoffice

- [x] 4.1 Sustituir el panel reducido por la estructura de bandas de la referencia: cabecera, simulador, controles, sidebar y canvas; verificar la ruta pública y la ausencia de llamadas de red en un test de componente. (REQ-001, REQ-012) — Verificado con `business-backoffice-panel.test.tsx`.
- [x] 4.2 Implementar KPIs, selector de periodo y gráfica SVG determinista con estados de datos y esqueletos; verificar valores iniciales, cambio de periodo y ocultación de datos en `skeletons`. (REQ-002, REQ-003, REQ-010) — Verificado con fixtures y render del panel.
- [x] 4.3 Implementar tabla de pedidos, búsqueda, paginación, estados, metadatos, registro manual y exportación; verificar interacciones accesibles y resultados filtrados en tests de componente. (REQ-003, REQ-005, REQ-006) — Verificado con búsqueda, pedido manual y CSV.
- [x] 4.4 Implementar roles, badge, banner lector, bloqueo de mutaciones, toast y feedback vivo; verificar comportamiento de los tres roles y motivo accesible del bloqueo. (REQ-004, REQ-010, REQ-012) — Verificado con escenario de lector y región `status`.
- [x] 4.5 Implementar drawer de cliente, historial, notas, edición, emisión de factura y control de foco; verificar apertura del cliente correcto, cancelación, `Escape` y restauración del foco. (REQ-007, REQ-008, REQ-012) — Verificado con apertura de `CLI-8841` y formulario de expediente.
- [x] 4.6 Implementar facturas pendientes, alertas de stock y audit log con sus estados, severidades, acciones y eventos; verificar render inicial y actualización tras cada mutación. (REQ-008, REQ-009, REQ-010) — Verificado con tests de runtime y componente.

## 5. Responsive, accesibilidad y estados

- [x] 5.1 Integrar los seis estados del simulador (`live`, `drawer`, `reader`, `toast`, `skeletons`, `empty`) y la recuperación de tabla vacía; verificar retorno a `live` conservando mutaciones. (REQ-010) — Verificado con E2E de estados reproducibles.
- [x] 5.2 Ajustar la composición para 375px y 1440px sin overflow horizontal ni pérdida de acciones principales; verificar con Playwright ambos viewports y metadatos visibles. (REQ-013) — Verificado en Chromium y Firefox, escritorio y móvil.
- [x] 5.3 Auditar nombres accesibles, foco visible, navegación por teclado, regiones vivas, `Escape` y `prefers-reduced-motion`; verificar con Playwright y el test automatizado de accesibilidad disponible. (REQ-012, REQ-013) — Verificado con roles, drawer, región `status` y reduced motion E2E.

## 6. Integración y quality gates

- [x] 6.1 Añadir o actualizar tests unitarios, de componentes y E2E específicos de Business Backoffice sin desactivar pruebas existentes; verificar cobertura de roles, filtros, acciones, persistencia, estados, responsive y teclado. (REQ-002 a REQ-013) — Verificado con 53 archivos y 210 tests unitarios/componentes, más 8 E2E específicos.
- [x] 6.2 Documentar la frontera mock y la ausencia de integraciones remotas en el módulo de dominio o documentación del cambio; verificar que no se añaden dependencias ni llamadas de red. (REQ-001, REQ-012, REQ-014) — Documentado en `domain/README.md`; `package.json` sin dependencias nuevas.
- [x] 6.3 Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm test:e2e`; registrar la salida real y corregir cualquier fallo antes de verificar. (REQ-014) — Verificado: lint, typecheck, 53/210 tests, build y 140/140 E2E pasados.
- [x] 6.4 Ejecutar `openspec validate 09-demo-business-backoffice --strict` y revisar la trazabilidad `REQ → TASK → TEST → VERIFY`; verificar que todos los requisitos tienen cobertura o un motivo explícito de pendiente. (REQ-014) — Verificado: cambio válido y trazabilidad cubierta por tareas/tests/E2E.

## Workflow follow-up

- Ejecutar `openspec-verify-change` después de completar las tareas y quality gates.
- Solicitar revisión independiente de `spec-verifier` y corregir hallazgos si existen.
- Esperar autorización final del usuario antes de sincronizar y archivar el cambio.
