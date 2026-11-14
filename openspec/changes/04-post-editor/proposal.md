# Proposal

## Why

La superficie actual de `/es/blog/editor` es un formulario reducido y no representa el editor editorial definido para el proyecto. La spec aprobada reúne la sustitución visual y funcional del editor, la persistencia mock y una lectura pública por slug para que los posts publicados tengan una URL SEO estable.

## What Changes

- Sustituir `/es/blog/editor` por la composición editorial de `resources/04_post_editor`, manteniendo la protección para `admin`, `editor` y `revisor`.
- Añadir el contrato editorial de posts, validación de publicación, telemetría derivada, assets de portada y estados `draft`, `review`, `scheduled` y `published`.
- Añadir un repositorio cliente mock persistente mediante `localStorage`, con validación de snapshots y fallback en memoria, sin acceso directo desde componentes.
- Añadir fixtures locales con un borrador editable y tres posts publicados, además de portadas seleccionables.
- Implementar edición Markdown limitada, preview seguro, toolbar, inspector, autosave, guardado, publicación inmediata, programación mock, eliminación y estado vacío.
- Añadir `/es/blog/[slug]` como ruta pública server-side que solo expone posts publicados y genera metadata dinámica.
- Actualizar los tres enlaces editoriales de la landing para usar los slugs públicos.
- Añadir cobertura unitaria, de componentes y E2E para editor, repositorios, permisos, persistencia, SEO, responsive, teclado y estados.

## Capabilities

### New Capabilities

- `post-editor`: contrato, edición, persistencia local y ciclo de vida mock de una pieza editorial.
- `public-post-reading`: lectura pública server-side de posts publicados por slug, metadata SEO y enlaces públicos.

### Modified Capabilities

- Ninguna; el repositorio OpenSpec no contiene capacidades existentes persistidas.

## Impact

- Afecta las rutas App Router de `/es/blog/editor`, `/es/blog/[slug]` y la landing de `/es/`.
- Afecta los repositorios mock, tipos de dominio, validadores, fixtures locales, componentes editoriales y tests.
- Mantiene la futura sustitución por Supabase como contrato, sin conexión remota, migraciones, credenciales ni dependencias nuevas.
- La lectura pública usa fixtures server-side independientes del `localStorage` del navegador, por lo que una publicación local no sincroniza automáticamente la ruta SSR.
