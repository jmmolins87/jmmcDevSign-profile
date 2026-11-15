# Tasks

## 1. Dominio y persistencia

- [x] 1.1 Crear tipos, estados, fixtures deterministas, contratos y validadores del dominio Lead Qualification; verificar con tests de dominio que los cinco leads, tiers, scores y reglas de validación son válidos.
- [x] 1.2 Implementar el repositorio mock persistente con snapshot versionado, fallback en memoria, recuperación segura y reset; verificar restauración válida, snapshot corrupto/incompatible y almacenamiento no disponible.

## 2. Runtime mock

- [x] 2.1 Implementar selección, filtros, presets, calificación e inyección determinista; verificar que las transiciones no usan reloj, aleatoriedad ni red y que Victor Kline no se duplica.
- [x] 2.2 Implementar aprobación idempotente, reasignación, edición de respuesta y pausa/reanudación; verificar validaciones, eventos y aislamiento entre leads.

## 3. Composición visual

- [x] 3.1 Sustituir el panel actual por el shell de referencia reutilizando tokens y primitivas existentes; verificar header fijo, geometría, hairlines, tipografías, densidad y acento naranja.
- [x] 3.2 Implementar command bar, simulador, cuatro KPIs, bandeja, expediente, secuencia, telemetría y footer operativo; verificar la composición principal sin errores de runtime.
- [x] 3.3 Implementar búsqueda, filtros por tier, selección y actualización reactiva del expediente; verificar nombre/empresa/puntuación, estado vacío y selección persistida.

## 4. Estados y acciones accesibles

- [x] 4.1 Implementar estados estándar, calificando, bandeja vacía y skeletons con feedback `aria-live`; verificar presets reproducibles y contenido no engañoso durante carga.
- [x] 4.2 Implementar aprobación, reasignación, edición de respuesta y pausa/reanudación mediante diálogos y controles accesibles; verificar guardar, cancelar, validación, foco y cierre con `Escape`.
- [x] 4.3 Implementar recarga de bandeja e inyección de lead test con transición determinista y protección contra duplicados; verificar que recargar restablece el estado estándar sin borrar datos persistidos.

## 5. Responsive, accesibilidad y documentación

- [x] 5.1 Implementar pestañas móviles, scroll, foco, teclado y respeto de `prefers-reduced-motion`; verificar 375px y 1440px sin overflow horizontal y con las pestañas `BANDEJA`, `DETALLE` y `SEGUIMIENTO`.
- [x] 5.2 Añadir tests unitarios y de componentes para dominio, repositorio, runtime, filtros, acciones, validación y recuperación; verificar la suite completa del proyecto.
- [x] 5.3 Actualizar el flujo E2E de la demo y verificar móvil y escritorio en Chromium y Firefox; verificar estados, acciones, accesibilidad y responsive en navegador real.
- [x] 5.4 Documentar la frontera futura de producción sin introducir integraciones remotas ni dependencias nuevas; verificar que la documentación coincide con los contratos mock.

## 6. Quality gates

- [x] 6.1 Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` y `openspec validate 07-demo-lead-qualification --strict`; verificar y registrar la salida real de cada comando.

## Workflow follow-up

- Ejecutar `openspec-verify-change` y la revisión independiente de `spec-verifier`.
- Sincronizar specs cuando corresponda y archivar solo tras aprobación final explícita del usuario.
