# Tasks

## 1. Localización y shell público

- [ ] 1.1 Crear la frontera de locale compartida para `es` y `en`, conservar las rutas españolas y añadir el mapa equivalente de landing, demos y autenticación; verificar navegación directa y enlaces internos en ambos idiomas. (REQ-003, REQ-014; TEST-001)
- [ ] 1.2 Añadir diccionarios tipados para navegación, acciones, estados, errores y feedback de landing, demos y autenticación; verificar que no quedan textos de interfaz españoles sin traducir en `/en`. (REQ-003; TEST-002)
- [ ] 1.3 Corregir el contenedor del header para compartir los límites horizontales del contenido; verificar 375px y 1440px sin overflow ni desalineación. (REQ-001; TEST-003)
- [ ] 1.4 Conectar `[ Acceder ]` del header, menú y móvil con la modal existente, incluyendo foco, cierre y navegación anterior; verificar el flujo completo de membresía. (REQ-004, REQ-013; TEST-004)

## 2. Temas y sticky de landing

- [x] 2.1 Extender el selector de tema a oscuro, claro y sistema con iconos, estados accesibles, persistencia local y reacción a cambios de `prefers-color-scheme`; verificar almacenamiento disponible y no disponible. (REQ-002, REQ-013; TEST-005)
- [ ] 2.2 Ajustar la escena sticky de demos para usar tramos amplios y umbrales estables, conservando reduced motion; verificar que pequeños desplazamientos no cambian de demo prematuramente. (REQ-005; TEST-006)
- [ ] 2.3 Añadir E2E de landing para alineación, idioma, tema, membresía, sticky y responsive; verificar `/es`, `/en`, 375px y 1440px. (REQ-001–REQ-005, REQ-013; TEST-007)

## 3. Runtime de reproducción mock

- [x] 3.1 Definir el contrato común de reproducción con estados, pasos, progreso, pausa, reanudación, reinicio y finalización; verificar transiciones válidas, idempotencia y reloj controlable con tests unitarios. (REQ-006, REQ-014; TEST-008)
- [x] 3.2 Integrar el reproductor en Agent Builder y Leads Workflow sin compartir fixtures ni estado de negocio; verificar inicio, pausa, reinicio, progreso y persistencia segura. (REQ-006; TEST-009)
- [x] 3.3 Integrar el reproductor en Lead Qualification, Orders Realtime y Business Backoffice; verificar que cada demo conserva sus operaciones existentes y expone estados visuales de reproducción. (REQ-006, REQ-012; TEST-010)
- [x] 3.4 Documentar el límite mock, el control determinista del reloj y la ausencia de servicios externos; verificar que la documentación coincide con los contratos. (REQ-014; TEST-011)

## 4. Leads Workflow

- [x] 4.1 Implementar posiciones iniciales y `AUTO-ALIGN` por capas/columnas con separación mínima, límites de canvas y validación de colisiones; verificar que ningún par de nodos se solapa en fixtures, reset, auto-align y snapshot restaurado. (REQ-007; TEST-012)
- [ ] 4.2 Ajustar cálculo de conexiones y render del canvas para que todas las aristas sigan a sus nodos después de zoom, alineación y restauración; verificar cada edge fixture y responsive. (REQ-007, REQ-013; TEST-013)
- [x] 4.3 Implementar la secuencia de ejecución por nodos y aristas, con eventos ordenados, estados activo/final/error y reinicio; verificar el recorrido completo sin duplicados. (REQ-008; TEST-014)
- [ ] 4.4 Añadir animación de nodo, arista y progreso con fallback de reduced motion; verificar que la animación se limpia al desmontar y que los estados siguen siendo observables sin movimiento. (REQ-008, REQ-013; TEST-015)
- [ ] 4.5 Añadir pruebas de componente y E2E de solapamiento, `AUTO-ALIGN`, ejecución secuencial, error, pausa, reinicio, teclado y 375px/1440px. (REQ-007, REQ-008, REQ-013; TEST-016)

## 5. Correcciones y visualización de demos

- [x] 5.1 Corregir el ciclo de skeletons de Lead Qualification para que cada carga controlada termine y muestre datos o error recuperable; verificar escenarios inicial, cambio de escenario, reinicio y error. (REQ-010, REQ-012; TEST-017)
- [x] 5.2 Implementar la reproducción de entrada y progresión KDS en Orders Realtime, conservando eventos, pausa, controles manuales, persistencia e idempotencia; verificar `NUEVO → EN PLANCHA → LISTO → ENTREGADO`. (REQ-009, REQ-012; TEST-018)
- [ ] 5.3 Conectar `[ VER ]` de Business Backoffice con el drawer correcto, restauración de foco, cierre por `Escape` y conservación de filtros/paginación; verificar pedido y cliente seleccionados. (REQ-011, REQ-013; TEST-019)
- [ ] 5.4 Mejorar feedback visual común de las cinco demos: progreso, estados, métricas, confirmaciones, vacíos, errores y regiones vivas; verificar que cada acción modifica una representación visible y accesible. (REQ-012, REQ-013; TEST-020)

## 6. Integración y quality gates

- [ ] 6.1 Ejecutar la suite unitaria y de componentes completa, comparar con la línea base y corregir fallos sin desactivar pruebas; verificar reproducción, locales, temas, layout, skeletons, KDS y drawer. (REQ-002, REQ-006–REQ-013; TEST-021)
- [ ] 6.2 Ejecutar E2E en Chromium y Firefox para `/es` y `/en`, 375px y 1440px, incluyendo teclado y reduced motion; verificar todos los recorridos principales. (REQ-001–REQ-013; TEST-022)
- [ ] 6.3 Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` y `openspec validate 10-landing-demo-experience --strict`; registrar la salida real y corregir cualquier fallo. (REQ-015; TEST-023)
- [ ] 6.4 Revisar la trazabilidad completa `REQ → TASK → TEST → VERIFY-PASS`, documentar riesgos residuales y eliminar temporales, capturas de trabajo y carpetas Playwright antes de cerrar. (REQ-015; TEST-024)

## Workflow follow-up

- Ejecutar `openspec-verify-change` tras completar todas las tareas.
- Ejecutar `spec-verifier` de forma independiente y corregir hallazgos antes del cierre.
- Sincronizar las capabilities cuando corresponda y archivar solo con aprobación final del usuario.
