# Tasks

## 1. Dominio y contratos

- [x] 1.1 Definir tipos de configuración, conectores, fuentes, runtime, mensajes y estados; verificar compilación estricta y cobertura de tipos.
- [x] 1.2 Implementar validación de configuración y despliegue; verificar campos obligatorios, conectores activos y errores por campo.
- [x] 1.3 Crear fixtures deterministas para configuración inicial, fuentes, conectores, mensajes y telemetría; verificar que no dependan de red, reloj o aleatoriedad.

## 2. Persistencia y servicios mock

- [x] 2.1 Implementar el repositorio Agent Builder con clave `localStorage` versionada, hidratación segura y reset; verificar snapshot válido, inválido y fallback.
- [x] 2.2 Implementar el servicio de runtime y despliegue mock; verificar transiciones, versión local, respuesta determinista y ausencia de llamadas externas.

## 3. Superficie de configuración

- [x] 3.1 Reconstruir la composición visual de la referencia con la barra de control, breadcrumb, estado, matriz, paneles y footer; verificar estructura a 1440px.
- [x] 3.2 Implementar edición de parámetros, presets de personalidad, conectores y estado de sincronización; verificar actualización visible sin recarga.
- [x] 3.3 Implementar fuentes `FILE`/`URL`, alta, baja y estado vacío; verificar que no se leen archivos ni URLs reales.
- [x] 3.4 Implementar validación accesible y despliegue mock; verificar bloqueo inválido y confirmación/versionado válido.

## 4. Runtime y conversación

- [x] 4.1 Implementar matriz de estados `idle`, `typing`, `error` y `deployed`; verificar representación y estado seleccionado.
- [x] 4.2 Implementar prompts rápidos, entrada de prompt, respuesta, mensajes, latencia y consumo; verificar flujo determinista con componentes.
- [x] 4.3 Implementar reinicio de conversación sin perder configuración; verificar hilo vacío y configuración conservada.

## 5. Responsive, accesibilidad y permisos

- [x] 5.1 Adaptar la composición a 375px y 1440px, incluyendo apilado móvil y overflow técnico controlado; verificar con Playwright.
- [x] 5.2 Verificar teclado, foco visible, nombres accesibles, `aria-live`, estados de error y `prefers-reduced-motion`; verificar con tests de componentes y navegador.
- [x] 5.3 Mantener la demo pública; verificar acceso anónimo y conservar la protección de las superficies administrativas/editoriales fuera de esta ruta.

## 6. Verificación y documentación

- [x] 6.1 Añadir tests unitarios y de componentes para dominio, repositorio, validación, runtime, persistencia y controles; verificar `pnpm test`.
- [x] 6.2 Actualizar E2E de Agent Builder y verificar el flujo completo a 375px y 1440px con `pnpm test:e2e`.
- [x] 6.3 Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm test:e2e`; documentar resultados y riesgos residuales.
- [x] 6.4 Documentar contratos mock y puntos de sustitución futura sin añadir credenciales, dependencias ni integraciones remotas.

## Workflow follow-up

- Revisar y aprobar la spec antes de cambiar manualmente a Build Mode.
- Tras la implementación, ejecutar `openspec verify` y la revisión independiente de `spec-verifier`.
- Archivar solo después de completar tareas, pruebas, Verify, aprobación final y sincronización de specs cuando corresponda.

## Verification evidence

- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS.
- `pnpm test`: PASS — 35 archivos, 124 tests.
- `pnpm build`: PASS — Next.js 16.4.6, ruta `/es/demos/agent-builder` generada.
- `pnpm test:e2e`: PASS — 104 tests en Chromium/Firefox, desktop/mobile; incluye recarga tras despliegue y rehidratación de versión/estado.
- Comprobación Playwright temporal de la superficie: PASS a 1440px y 375px; cero errores de consola y cero peticiones externas; servidor detenido y artefactos temporales eliminados.
- Corrección verificada tras revisión independiente: el repositorio sincroniza `agent.runtimeState` con `runtime.state` al persistir y la UI rehidrata la confirmación `deployedVersion`.
- Riesgos residuales: Vitest mantiene un warning informativo sobre `configLoader: native` y la persistencia sigue siendo local/fallback en memoria por diseño; no hay integraciones de producción en esta spec.
