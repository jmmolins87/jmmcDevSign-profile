# Design

## Context

La aplicación es un proyecto Next.js 16 con App Router, React 19, Tailwind CSS v4, tokens editoriales existentes, repositorios mock y sesiones mock. La ruta `/es/blog/editor` y su repositorio actual cubren únicamente un formulario reducido con un modelo incompatible con el contrato editorial aprobado. La ruta pública debe separar la lectura server-side de la persistencia local del navegador.

## Goals / Non-Goals

**Goals:**

- Mantener una frontera clara entre dominio editorial, adaptador cliente persistente, adaptador server-side de fixtures y componentes.
- Reutilizar la protección de superficies y tokens visuales existentes, manteniendo la dirección brutalist editorial de los recursos aprobados.
- Dar soporte a edición, preview seguro, estados, validación, persistencia local y lectura pública por slug sin añadir dependencias.
- Mantener contratos estables para sustituir posteriormente los adaptadores mock por Supabase Database y Storage.
- Probar las rutas críticas en unidades, componentes y navegador real.

**Non-Goals:**

- Conectar Supabase, crear migraciones, activar Auth real o desplegar.
- Ejecutar jobs, colas o cron reales para publicaciones programadas.
- Sincronizar `localStorage` con los fixtures server-side.
- Añadir bandeja multi-post, colaboración, comentarios reales, moderación, WYSIWYG o proveedor Markdown externo.

## Decisions

1. **Dos adaptadores con un contrato de dominio común.** El repositorio cliente encapsulará `localStorage` y fallback en memoria; `PublicPostRepository` leerá fixtures deterministas desde servidor. Se descarta un único repositorio isomórfico porque ocultaría la diferencia aprobada entre estado local y lectura pública.

2. **Un dominio editorial dedicado.** Se reemplaza el modelo reducido (`body`, `commentsEnabled`) por `PostDraft`, `CreatePostInput`, `UpdatePostInput`, `PostStatus`, `PublishMode`, `PostTelemetry`, `CoverAsset` y validadores puros. Esto permite probar reglas sin montar React y deja la UI independiente del proveedor.

3. **Renderer Markdown propio limitado.** Se implementará una transformación segura para la sintaxis que la toolbar puede insertar. HTML crudo y URLs inseguras se convierten en texto descartado; no se añade una dependencia nueva ni se ejecuta HTML arbitrario.

4. **Editor como isla cliente y lectura pública como Server Component.** El editor necesita interacción, timers, selección de texto y `localStorage`; la página pública resolverá fixtures en servidor, llamará `notFound()` para estados no públicos y expondrá `generateMetadata` desde el mismo adaptador.

5. **Estado único activo y estados explícitos.** El editor no tendrá listado. Mantendrá el post activo o un estado vacío, con eventos de simulación visibles para verificar edición, guardado, publicación, error y eliminación.

6. **Autoguardado controlado.** Un debounce de 800 ms se disparará solo ante cambios de documento y pasará por el mismo validador que publicación; guardar manualmente seguirá permitiendo borradores incompletos.

## Risks / Trade-offs

- [Persistencia local corrupta] → validar cada registro y el array completo; ante fallo, restaurar fixtures seguros y continuar en memoria con estado visible.
- [Diferencia entre editor y lectura pública] → documentar y mostrar el comportamiento mock; los fixtures server-side nunca se mutan desde el cliente.
- [Renderer Markdown incompleto] → limitar las acciones de toolbar a la sintaxis soportada y cubrir HTML, enlaces y esquemas inseguros con tests.
- [Editor denso en móvil] → usar un inspector tipo drawer accesible, cerrar con Escape, devolver foco y verificar 375px y 1440px en Playwright.
- [Cambios de API de Next.js 16] → consultar la guía local de `node_modules/next/dist/docs` y mantener la página pública como Server Component con `generateMetadata` y `notFound`.

## Migration Plan

1. Implementar y verificar el dominio y los adaptadores mock sin tocar servicios remotos.
2. Reemplazar la superficie del editor y añadir la ruta pública con fixtures versionados.
3. Ejecutar lint, typecheck, tests, build y E2E; limpiar temporales y evidencias de trabajo.
4. Para una futura migración, sustituir únicamente los adaptadores cliente/server-side manteniendo contratos y componentes.

Rollback: revertir los cambios de la rama y conservar la ruta existente; no hay migraciones ni datos remotos que revertir.

## Open Questions

No hay preguntas abiertas que cambien el alcance, los contratos o la descomposición aprobada.
