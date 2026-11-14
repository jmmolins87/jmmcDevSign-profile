# Spec Delta

## Purpose

Esta capacidad permite leer anónimamente los posts publicados mediante URLs públicas estables por slug y construir metadata SEO coherente sin exponer estados editoriales no publicados.

## ADDED Requirements

### Requirement: Ruta pública por slug

El sistema SHALL exponer `/es/blog/[slug]` y resolver cada solicitud por `slug` mediante un adaptador server-side separado del repositorio cliente. Solo los posts con estado `published` SHALL producir contenido público.

#### Scenario: Post publicado

- **WHEN** una persona anónima visita `/es/blog/{slug}` para un post publicado
- **THEN** la ruta muestra el contenido editorial, resumen, portada, categoría, tags y fecha pública sin requerir autenticación

#### Scenario: Estado no publicado

- **WHEN** una persona solicita el slug de un borrador, post en revisión o post programado no publicado
- **THEN** la ruta responde 404 y no genera contenido indexable

#### Scenario: Slug inexistente

- **WHEN** se solicita un slug que no existe
- **THEN** la ruta responde 404 mediante `notFound`

### Requirement: Fixtures server-side y separación de persistencia

El adaptador `PublicPostRepository` SHALL exponer `getPublishedBySlug`, leer fixtures deterministas versionados y nunca intentar leer `localStorage`. Los fixtures SHALL incluir un borrador editable y tres posts publicados para los dossiers de la landing.

#### Scenario: Lectura server-side aislada

- **WHEN** la ruta pública carga un post
- **THEN** obtiene sus datos desde fixtures server-side y no desde el repositorio cliente ni desde `localStorage`

#### Scenario: Publicación local no sincronizada

- **WHEN** el editor publica localmente un borrador
- **THEN** el cambio queda en el repositorio cliente y la ruta pública no se presenta como sincronizada con él

### Requirement: Metadata SEO dinámica

La ruta pública SHALL generar `title`, `description`, URL canónica y Open Graph a partir del post publicado. La canonical SHALL usar `NEXT_PUBLIC_SITE_URL` y el fallback `https://www.jmmcdevsign.es`, con formato `https://www.jmmcdevsign.es/es/blog/{slug}`.

#### Scenario: Metadata de post publicado

- **WHEN** se resuelve un post publicado
- **THEN** la metadata contiene título, descripción, canonical y Open Graph derivados del post

#### Scenario: Metadata de post no público

- **WHEN** el slug no resuelve un post publicado
- **THEN** la ruta no genera metadata indexable de contenido editorial y devuelve 404

### Requirement: Enlaces públicos de la landing

Los tres enlaces de lectura editorial de la landing SHALL apuntar a los slugs publicados bajo `/es/blog/{slug}` y no a `/es/blog/editor`; el enlace de acceso editorial SHALL conservar `/es/blog/editor`.

#### Scenario: Navegación desde landing

- **WHEN** una persona activa una de las tres tarjetas de lectura
- **THEN** navega a la ruta pública del slug correspondiente

#### Scenario: Acceso editorial separado

- **WHEN** una persona activa el enlace de acceso de miembros
- **THEN** permanece en `/es/blog/editor`, que continúa protegido
