# Spec Delta

## Purpose

Esta capacidad proporciona una superficie editorial protegida para crear, editar, guardar, publicar y eliminar una única pieza activa con persistencia mock local y contratos estables para una futura migración de almacenamiento.

## ADDED Requirements

### Requirement: Contrato editorial y validación

El sistema SHALL modelar un post con `id`, `title`, `slug`, `excerpt`, `bodyMarkdown`, `status`, `category`, `tags`, `coverAssetId` opcional, `publishMode`, `scheduledAt` opcional, `publishedAt` opcional, `access`, `rights`, `createdAt` y `updatedAt`. Los estados SHALL ser `draft`, `review`, `scheduled` o `published`; el acceso SHALL ser `public` y los derechos SHALL ser `CC-BY-4.0`.

#### Scenario: Slug manual válido

- **WHEN** el usuario edita el slug
- **THEN** el sistema acepta únicamente `a-z`, números y guiones simples con el patrón `^[a-z0-9]+(?:-[a-z0-9]+)*$` y no lo normaliza automáticamente

#### Scenario: Publicación inválida

- **WHEN** el usuario intenta publicar o programar un documento con título vacío, slug inválido, categoría vacía, ningún tag, resumen de más de 160 caracteres o fecha programada no futura
- **THEN** el sistema bloquea la operación y muestra errores accesibles asociados a los campos afectados

#### Scenario: Telemetría derivada

- **WHEN** cambia `bodyMarkdown`
- **THEN** el sistema calcula palabras, minutos de lectura y nivel técnico `advanced` desde el Markdown, sin aceptar esos valores como datos confiables del cliente ni llamar a analytics

### Requirement: Repositorio cliente persistente

El sistema SHALL exponer un contrato `PostRepository` con `list`, `get`, `getBySlug`, `create`, `update` y `remove`. El adaptador cliente SHALL persistir con la clave `jmmc-posts-v1`, validar el snapshot antes de hidratarlo y restaurar fixtures seguros o usar fallback en memoria cuando el JSON sea corrupto o no exista almacenamiento.

#### Scenario: Recuperación tras recarga

- **WHEN** se guarda un cambio y se recarga el editor
- **THEN** el repositorio cliente recupera el post guardado desde `localStorage`

#### Scenario: Snapshot corrupto

- **WHEN** la clave `jmmc-posts-v1` contiene JSON inválido o datos que no cumplen el contrato
- **THEN** el repositorio descarta ese snapshot, conserva fixtures seguros y deja disponible el editor sin lanzar un error de runtime

#### Scenario: Almacenamiento no disponible

- **WHEN** `localStorage` no está disponible o falla durante la persistencia
- **THEN** el repositorio continúa en memoria y la UI muestra el estado de sincronización mock correspondiente

### Requirement: Editor protegido y composición editorial

`/es/blog/editor` SHALL estar protegido para `admin`, `editor` y `revisor`, y los tres roles SHALL conservar las mismas capacidades editoriales de esta demo. La superficie SHALL mantener header, command bar, simulador visible, canvas, inspector y footer, con la dirección visual de `resources/00_brutalist_editorial_architecture/DESIGN.md` y `resources/04_post_editor`.

#### Scenario: Acceso por rol editorial

- **WHEN** una sesión mock activa pertenece a `admin`, `editor` o `revisor`
- **THEN** puede abrir el editor y editar, guardar, publicar y eliminar el post mock

#### Scenario: Acceso anónimo

- **WHEN** una persona sin sesión visita `/es/blog/editor`
- **THEN** ve el estado de sesión requerida y no el editor interactivo

#### Scenario: Simulador de estados

- **WHEN** el usuario usa el simulador visible
- **THEN** puede representar edición, guardado, publicación, validación fallida y estado vacío sin herramientas externas

### Requirement: Edición Markdown y preview seguro

El canvas SHALL permitir editar título, slug, resumen, categoría, tags, portada y cuerpo Markdown. La toolbar SHALL insertar sintaxis Markdown funcional en el punto de edición y el preview SHALL renderizar solo la sintaxis soportada, descartando HTML crudo y esquemas inseguros sin ejecutar scripts.

#### Scenario: Inserción desde toolbar

- **WHEN** el usuario coloca el cursor en el cuerpo y activa una acción de la toolbar
- **THEN** el sistema inserta la sintaxis correspondiente para encabezado, énfasis, enlace, cita, código, imagen o divisor en el punto de edición

#### Scenario: Markdown no seguro

- **WHEN** el cuerpo contiene HTML crudo, `javascript:` u otro esquema inseguro
- **THEN** el preview no ejecuta ni expone ese contenido como HTML activo

### Requirement: Guardado, autosave y publicación mock

El sistema SHALL permitir guardar borradores incompletos y mostrar un estado de sincronización. El autoguardado SHALL esperar 800 ms de inactividad y persistir únicamente documentos válidos. La publicación inmediata SHALL validar y cambiar el estado a `published`; la programación SHALL exigir fecha UTC futura, guardar `scheduledAt` en ISO con `Z` y no ejecutar jobs reales.

#### Scenario: Guardar borrador incompleto

- **WHEN** el usuario pulsa guardar con campos editoriales incompletos
- **THEN** el repositorio actualiza el borrador y la UI anuncia el guardado mock sin exigir validación de publicación

#### Scenario: Autoguardado válido

- **WHEN** un documento válido permanece sin cambios durante 800 ms
- **THEN** el sistema lo persiste y muestra el estado de autoguardado completado

#### Scenario: Autoguardado inválido

- **WHEN** un documento incompleto o inválido permanece sin cambios durante 800 ms
- **THEN** el sistema no lo persiste como autosave y muestra el motivo de validación

#### Scenario: Publicación programada

- **WHEN** el usuario selecciona programación y proporciona una fecha UTC futura
- **THEN** el sistema guarda el estado `scheduled` y `scheduledAt` sin iniciar un proceso real

### Requirement: Portadas, eliminación y estado vacío

El sistema SHALL permitir seleccionar o reemplazar portadas desde fixtures locales, eliminar la portada y eliminar el post mediante confirmación accesible. Tras eliminar el único post activo SHALL mostrar un estado vacío desde el que se pueda crear o recuperar un nuevo borrador.

#### Scenario: Reemplazar portada

- **WHEN** el usuario selecciona una portada de los fixtures locales
- **THEN** el editor guarda su `coverAssetId` y muestra la alternativa textual definida por el asset

#### Scenario: Eliminar post

- **WHEN** el usuario confirma el diálogo accesible de eliminación
- **THEN** el repositorio elimina el post y el editor transita al estado vacío

#### Scenario: Recuperar borrador

- **WHEN** el editor está vacío y el usuario elige crear o recuperar un borrador
- **THEN** el sistema vuelve a mostrar una única pieza activa editable

### Requirement: Inspector y responsive accesible

El inspector SHALL mostrar categoría, tags, slug, resumen SEO/RSS, publicación inmediata o programada, telemetría, acceso, derechos y zona crítica. La interfaz SHALL ser usable a 375px y 1440px, permitir abrir y cerrar el inspector en móvil, mantener foco visible, nombres accesibles y `aria-live`, y respetar `prefers-reduced-motion`.

#### Scenario: Inspector móvil

- **WHEN** una persona abre el inspector en un viewport móvil
- **THEN** el inspector se presenta sin bloquear el canvas y puede cerrarse mediante un control accesible que devuelve el foco

#### Scenario: Estado anunciado

- **WHEN** el estado de guardado, publicación o validación cambia
- **THEN** la UI comunica el resultado en una región `aria-live` sin depender únicamente del color
