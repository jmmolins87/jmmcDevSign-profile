# Evidencias de implementación y verificación

## Autorizaciones y punto de partida

- Spec: `specs/10-landing-demo-experience.md`, estado inicial `Approved`.
- Autorización de implementación: invocación explícita de `spec-impl` por el usuario.
- Entorno: modo con escritura habilitada, rama `spec-10-landing-demo-experience`.
- Commit de la planificación anterior: `fbe8fb5`, conforme a la regla del proyecto de guardar la fase anterior al autorizar la siguiente.
- Context7: dos consultas de resolución (Next.js y React) devolvieron `Monthly quota exceeded`. El usuario autorizó expresamente continuar con documentación oficial local y webs oficiales.
- Fuentes disponibles: Next.js 16.4.6 en `node_modules/next/dist/docs/`; React en `https://react.dev/reference/react`; Vitest en `https://vitest.dev/api/vi`; Playwright en `https://playwright.dev/docs/clock`.
- Línea base ejecutada antes de modificar código: `pnpm test` → **53 archivos, 211 tests PASS**, 40.44 s. Aviso no bloqueante de Vite sobre la futura configuración nativa.
- `openspec validate 10-landing-demo-experience --strict` → `Change '10-landing-demo-experience' is valid`.

## Registro de fases

| Fase | Estado | Evidencia |
|---|---|---|
| Planificación anterior | Artefactos existentes; ejecución previa no auditada en esta sesión | Propuesta, tres capabilities, diseño y tareas persistidos |
| Preflight | EJECUTADO | Spec Approved, `openspec status`, `instructions apply`, validación estricta y estado Git |
| Apply | EN CURSO | Agentes reales de frontend con archivos delimitados para locale/landing, workflow/reproductor y otras demos |
| Testing | PENDIENTE | Línea base registrada; faltan gates sobre implementación final |
| OpenSpec Verify | PENDIENTE | Se ejecutará tras implementación y pruebas |
| Spec Verifier independiente | PENDIENTE | Se ejecutará con un agente ajeno a la implementación |
| Archivo | PENDIENTE | Requiere dictamen APPROVED y autorización final del usuario |

## Trazabilidad y resultados

Riesgo de verificación: **alto** para regresión de autenticación (sesión, roles, validación y ausencia de credenciales persistidas por el cambio de idioma), **medio** para rutas, persistencia y máquinas de estados de las demos. Se requieren pruebas positivas y negativas de auth, recuperación de almacenamiento, relojes controlados, integración y recorridos de navegador en los cuatro proyectos Playwright.

Coordinación registrada en `docs/discusiones/10-landing-demo-contracts.md`.

Los identificadores TEST de `tasks.md` son objetivos de cobertura hasta registrar aquí su evidencia real; no constituyen por sí solos un resultado PASS.

| Tarea | Requisitos / test planificado | Evidencia ejecutada | Resultado |
|---|---|---|---|
| 3.1 | REQ-006, REQ-014 / TEST-008 | `pnpm exec vitest run tests/unit/demo-playback.test.ts` | 6 tests PASS: tiempo restante al pausar, reanudación idempotente, finalización, reinicio, error, carreras inicio/reset/stop y espera de mutaciones en curso |
| 2.1 | REQ-002, REQ-013 / TEST-005 | `tests/components/theme-selector.test.tsx`, incluido en `pnpm test` final de integración | PASS: selección única, cambio del sistema operativo y almacenamiento bloqueado |
| 3.2–3.3 | REQ-006, REQ-012 / TEST-009–010 | `tests/components/demo-walkthroughs.test.tsx`, `demo-experience-panels.test.tsx` y regresiones de los cinco paneles, incluidos en `pnpm test` | PASS: adaptadores aislados, operaciones anteriores, progreso y controles |
| 3.4 | REQ-014 / TEST-011 | Lectura de `app/lib/README.md` frente a `demo-playback.ts`, hook y adaptadores; búsqueda independiente de HTTP/WebSocket/SSE | PASS: contrato y reloj documentados, sin servicios remotos ni fixtures compartidos |
| 4.1, 4.3 | REQ-007–008 / TEST-012, TEST-014 | `tests/unit/workflow-layout-playback.test.ts` y `tests/components/demo-walkthroughs.test.tsx`, incluidos en `pnpm test` | PASS: límites, separación, reparación de snapshots, IDs únicos, orden, idempotencia y detención ante error |
| 5.1–5.2 | REQ-009–010, REQ-012 / TEST-017–018 | `tests/components/demo-experience-panels.test.tsx` y regresiones Qualification/Orders, incluidos en `pnpm test` | PASS: fin/cancelación de skeleton, dos pedidos, ciclo completo, pausa, eventos únicos y reset |

## Gates de integración — en curso

- `pnpm lint` → PASS (exit 0).
- `pnpm typecheck` → PASS (exit 0), tras regenerar tipos de rutas y corregir tres opciones `exact` no admitidas por `getByRole`; se conservaron las aserciones.
- `pnpm test` → **60 archivos / 244 tests PASS**, 32.61 s. Esta cifra es anterior a la regresión adicional de búsqueda vacía detectada por el verificador; se actualizará al integrar esa corrección.
- `pnpm build` → PASS: compilación, tipos y generación de 43 páginas. Primer intento detectó `IncompatibleParallelRouteSlotsError`; se corrigió la estructura de slots con `default.tsx`, sin desactivar la validación estricta.
- `pnpm test:e2e` → EN CURSO. Primer intento no ejecutó tests porque el sandbox devolvió `listen EPERM` en 3099; se relanzó con permisos de ejecución adecuados. No se cuenta ese intento como evidencia de fallo de aplicación.
- `openspec validate 10-landing-demo-experience --strict` → PASS.

## Comprobaciones preliminares de navegador

- Chrome real, build preliminar: header y contenido alineados a 1440px (extremos 48/1392) y 375px (16/359), sin overflow horizontal. Cinco nodos del workflow, sin pares solapados.
- Se observó pérdida de foco al cerrar autenticación interceptada; el especialista corrigió el shell usando el segmento activo de children, pendiente de confirmar sobre build final.
- Se observó React #418 al hidratar workflow en una build realizada durante ediciones; la build estable y sus pruebas de `pageerror` deben determinar si persiste.
- Las capturas preliminares se leyeron y eliminaron; el servidor propio 3107 de esa prueba se detuvo. El servidor de desarrollo preexistente de otra sesión no se modificó.
