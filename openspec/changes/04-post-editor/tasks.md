# Tasks

## 1. Dominio y persistencia

- [x] 1.1 Crear los tipos editoriales, inputs, estados, assets, telemetría y validadores puros; verificar con tests unitarios de contrato y validación (`pnpm test` → 26 archivos / 74 tests passed; `pnpm typecheck` → passed).
- [x] 1.2 Implementar el repositorio cliente con clave `jmmc-posts-v1`, `getBySlug`, creación, actualización, eliminación, validación de snapshots y fallback en memoria; verificar persistencia, corrupción y ausencia de `localStorage` en tests (`pnpm test` → 27 archivos / 79 tests passed; `pnpm typecheck` → passed).
- [x] 1.3 Implementar el repositorio server-side de fixtures publicados y las portadas locales; verificar que devuelve solo posts publicados por slug y que incluye un borrador y tres posts públicos (`pnpm test` → 28 archivos / 83 tests passed; `pnpm typecheck` → passed).

## 2. Superficie editorial

- [x] 2.1 Sustituir la página y el panel reducido por la composición de `resources/04_post_editor`, reutilizando tokens, protección de roles y primitivas existentes; verificar render sin errores para `admin`, `editor` y `revisor` (`pnpm exec vitest run tests/components/post-editor-panel.test.tsx` → 2 tests passed; `pnpm typecheck` → passed).
- [x] 2.2 Implementar header, command bar, simulador visible, footer e indicadores de guardado/publicación; verificar estados de edición, guardado, publicación, validación fallida y vacío con tests de componentes (`pnpm exec vitest run tests/components/post-editor-panel.test.tsx` → 4 tests passed).
- [x] 2.3 Implementar canvas, título, portada, textarea Markdown, toolbar, preview seguro, telemetría y estado vacío; verificar inserción, preview seguro y palabras/minutos en tests de componentes y unidad (`pnpm exec vitest run tests/components/post-editor-panel.test.tsx` → 6 tests passed; `pnpm typecheck` → passed).
- [x] 2.4 Implementar inspector con categoría, tags, slug, resumen, publicación inmediata/programada, acceso, derechos, telemetría y zona crítica; verificar etiquetas accesibles y validación de campos (`pnpm exec vitest run tests/components/post-editor-panel.test.tsx` → 7 tests passed; `pnpm typecheck` → passed).
- [x] 2.5 Implementar selección/eliminación de portada, diálogo accesible de eliminación, creación/recuperación de borrador y drawer de inspector móvil; verificar foco, Escape y transición a estado vacío (`pnpm exec vitest run tests/components/post-editor-panel.test.tsx` → 9 tests passed; `pnpm typecheck` → passed).

## 3. Ciclo de edición y seguridad

- [x] 3.1 Implementar renderer Markdown propio limitado a la toolbar, descartando HTML crudo y esquemas inseguros; verificar XSS, enlaces, imágenes y bloques soportados sin dependencias nuevas (`pnpm exec vitest run tests/components/markdown-renderer.test.tsx` → 2 tests passed; `pnpm lint` y `pnpm typecheck` → passed).
- [x] 3.2 Implementar guardado manual incompleto, autosave con debounce de 800 ms, publicación inmediata, scheduling UTC futuro, estados visibles y manejo de fallos de persistencia; verificar con tests de componentes y timers deterministas (`pnpm exec vitest run tests/components/post-editor-panel.test.tsx` → 11 tests passed; `pnpm typecheck` → passed).
- [x] 3.3 Mantener la frontera de acceso: componentes y rutas no acceden directamente a `localStorage`, fixtures ni Supabase; verificar con revisión de imports y tests de roles (`pnpm exec vitest run tests/components/protected-surface.test.tsx tests/unit/public-post-repository.test.ts` → 10 tests passed; revisión `rg` → frontera limpia).

## 4. Lectura pública y SEO

- [x] 4.1 Crear `/es/blog/[slug]` como lectura pública server-side con layout editorial coherente; verificar lectura anónima de un post publicado y ausencia de dependencia de `localStorage` (`pnpm exec vitest run tests/components/public-post-page.test.tsx tests/unit/public-post-repository.test.ts` → 7 tests passed).
- [x] 4.2 Implementar resolución por slug, `notFound` para inexistentes/no publicados y metadata dinámica con title, description, canonical y Open Graph; verificar formato canonical y 404 (`pnpm exec vitest run tests/components/public-post-page.test.tsx` → 3 tests passed; `pnpm typecheck` → passed).
- [x] 4.3 Actualizar los tres enlaces editoriales de la landing a sus slugs publicados y conservar `/es/blog/editor` para acceso editorial; verificar navegación E2E (`pnpm exec playwright test e2e/post-editor.spec.ts --project=chromium-desktop --project=chromium-mobile` → 8 passed).

## 5. Cobertura y calidad

- [x] 5.1 Añadir tests unitarios para modelo, validación, telemetría, Markdown, repositorios, persistencia y slug; verificar con `pnpm test` (`31` archivos / `102` tests passed).
- [x] 5.2 Añadir tests de componentes para editor, inspector, toolbar, preview, modales, estados, autosave, permisos, estado vacío, sesión activa y fallback de persistencia; verificar con `pnpm test` (`31` archivos / `102` tests passed).
- [x] 5.3 Añadir tests E2E para edición, recarga, publicación, scheduling, eliminación, lectura pública, SEO, 404, landing, responsive y teclado; verificar con `pnpm test:e2e` (`104` passed en Chromium/Firefox desktop/mobile).
- [x] 5.4 Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` y `pnpm test:e2e`; todos pasan: lint, typecheck, build, `31` archivos / `102` tests unitarios y `104` E2E.
- [x] 5.5 Eliminar temporales, capturas de trabajo y carpetas `.playwright-mcp`/Playwright generadas; verificado sin servidor en `3099`, sin `test-results` ni `.playwright-mcp`, y `git diff --check` limpio.

## Workflow follow-up

- Ejecutar `openspec verify`/`openspec-verify-change` y la revisión independiente de `spec-verifier`.
- Solicitar aprobación final del usuario antes de sincronizar o archivar el cambio.
