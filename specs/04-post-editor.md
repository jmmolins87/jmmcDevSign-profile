# SPEC 04 — Editor de posts y URL pública SEO por slug

> **Status:** Implemented
> **Depends on:** SPEC 01, SPEC 02, SPEC 03
> **Date:** 2026-11-14
> **Revision:** 2026-11-14 — decisiones de arquitectura, persistencia, fixtures y validación
> **Objective:** Sustituir `/es/blog/editor` por un editor editorial fiel a `resources/04_post_editor` y añadir la ruta pública `/es/blog/[slug]`, con datos mock persistentes y contratos preparados para una futura migración a Supabase.

## Scope

**In:**

- Sustituir la superficie actual de `/es/blog/editor` por la composición visual de `resources/04_post_editor`.
- Mantener visible y funcional el simulador de estados de la referencia.
- Mantener la dirección visual de `resources/00_brutalist_editorial_architecture/DESIGN.md`.
- Mantener el editor protegido para los roles `admin`, `editor` y `revisor`.
- Mantener los tres roles con las mismas capacidades editoriales en esta demo.
- Implementar una barra de comandos con volver al panel, estado, autoguardado, guardar borrador, publicar y sesión activa.
- Implementar el canvas editorial con título, portada, toolbar Markdown, contenido, metadatos de compilación y estado vacío.
- Implementar el inspector con categoría, tags, slug, resumen SEO/RSS, publicación inmediata o programada, telemetría, acceso, derechos y zona crítica.
- Implementar título, slug, resumen, categoría, tags, portada y cuerpo Markdown como campos editables.
- Implementar una toolbar que inserte sintaxis Markdown para encabezados, énfasis, enlaces, citas, código, imágenes y divisores.
- Implementar un preview accesible y seguro del contenido Markdown actual.
- Persistir los cambios mock mediante `localStorage` a través del repositorio, sin acceso directo desde los componentes.
- Separar el adaptador cliente basado en `localStorage` del adaptador server-side basado en fixtures publicados.
- Implementar guardado manual de borradores incompletos y autoguardado mock con debounce de 800 ms, validación y estado visible.
- Implementar publicación inmediata mock.
- Implementar publicación programada mock con fecha explícita UTC y validación de fecha futura, sin ejecutar jobs reales.
- Implementar selección de portadas desde fixtures locales mock.
- Implementar eliminación con confirmación accesible y transición al estado vacío.
- Permitir iniciar o recuperar un nuevo borrador desde el estado vacío.
- Mantener una única pieza activa en la superficie; no añadir una bandeja/listado de posts en esta spec.
- Mantener fixtures iniciales con un borrador editable y tres posts publicados para los dossiers de la landing, sin mostrar una bandeja editorial.
- Añadir la ruta pública `/es/blog/[slug]` para lectura anónima de posts publicados.
- Resolver la ruta pública por `slug`, no por `id` ni por `/es/blog/editor`.
- Generar metadata SEO dinámica desde el post: título, descripción, URL canónica y Open Graph.
- Dejar los contratos de repositorio preparados para sustituir el mock por un adaptador Supabase sin cambiar la UI.
- Añadir tests unitarios, de componentes y E2E para el editor, persistencia, permisos, SEO, responsive y estados.

**Out of scope (for future specs):**

- Conectar la aplicación a un proyecto remoto de Supabase durante esta fase.
- Crear migraciones, tablas, políticas RLS, funciones SQL o Edge Functions.
- Activar Supabase Auth real o autorización server-side.
- Implementar storage real para imágenes o subida de archivos a Supabase Storage.
- Ejecutar procesos reales de publicación programada, colas o cron jobs.
- Añadir una bandeja/listado, filtros o gestión multi-post.
- Implementar colaboración multiusuario, locks o edición concurrente.
- Implementar comentarios reales o moderación.
- Hacer públicos los borradores, posts en revisión o posts programados antes de su publicación.
- Añadir un proveedor Markdown externo o un editor WYSIWYG.
- Añadir nuevas dependencias sin autorización explícita.
- Sincronizar automáticamente los cambios de `localStorage` del editor con la lectura pública server-side.
- Desplegar, cambiar producción o ejecutar migraciones remotas.

## Data model

La implementación local mantiene un repositorio mock persistente. La integración con Supabase queda representada por contratos y campos estables, sin conexión remota ni esquema SQL en esta spec.

### Post editorial

```ts
type PostStatus = "draft" | "review" | "scheduled" | "published";

type PublishMode = "immediate" | "scheduled";

type PostAccess = "public";

type PostRights = "CC-BY-4.0";

type PostDraft = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  status: PostStatus;
  category: string;
  tags: string[];
  coverAssetId?: string;
  publishMode: PublishMode;
  scheduledAt?: string;
  publishedAt?: string;
  access: PostAccess;
  rights: PostRights;
  createdAt: string;
  updatedAt: string;
};

type CreatePostInput = Omit<PostDraft, "id" | "createdAt" | "updatedAt">;

type UpdatePostInput = Partial<Omit<PostDraft, "id" | "createdAt" | "updatedAt">>;
```

`review` se conserva por compatibilidad con el repositorio actual, aunque no se añade una acción visual específica de revisión en esta spec. La interfaz principal de la referencia trabaja con borrador, guardado, publicación, error de validación y estado vacío.

### Telemetría derivada

```ts
type PostTelemetry = {
  wordCount: number;
  readingMinutes: number;
  technicalLevel: "advanced";
};
```

La telemetría se calcula desde `bodyMarkdown`; no se acepta como dato confiable del cliente ni se conecta a analytics reales.

### Validación editorial

El slug se edita manualmente y debe cumplir `^[a-z0-9]+(?:-[a-z0-9]+)*$`. No se normaliza automáticamente.

La validación de publicación exige título no vacío, slug válido, categoría no vacía, al menos un tag, resumen de un máximo de 160 caracteres y, para `scheduled`, una fecha UTC futura. Guardar borrador puede conservar campos incompletos; el autoguardado solo persiste cuando el documento es válido.

### Assets de portada

```ts
type CoverAsset = {
  id: string;
  src: string;
  alt: string;
  label: string;
};
```

Los assets son locales y versionados. `coverAssetId` permite sustituirlos posteriormente por URLs o identificadores de Supabase Storage sin cambiar el contrato de la UI.

### Contrato de repositorio

```ts
interface PostRepository {
  list(): Promise<PostDraft[]>;
  get(id: string): Promise<PostDraft | null>;
  getBySlug(slug: string): Promise<PostDraft | null>;
  create(input: CreatePostInput): Promise<PostDraft>;
  update(id: string, input: UpdatePostInput): Promise<PostDraft>;
  remove(id: string): Promise<void>;
}
```

El adaptador cliente del repositorio mock implementa este contrato y persiste con la clave `jmmc-posts-v1`. Debe validar el snapshot antes de hidratarlo y restaurar fixtures seguros si el JSON está corrupto o no existe almacenamiento disponible.

La lectura pública utiliza un adaptador server-side separado:

```ts
interface PublicPostRepository {
  getPublishedBySlug(slug: string): Promise<PostDraft | null>;
}
```

Este adaptador lee fixtures deterministas versionados y nunca intenta leer `localStorage`. Por tanto, una publicación local del editor se refleja en el editor y su repositorio cliente, pero no muta el fixture público server-side.

Los componentes y las rutas no acceden directamente a `localStorage`, fixtures ni al cliente Supabase.

### Contrato de metadata pública

La ruta `/es/blog/[slug]` debe obtener el post publicado por `slug` desde el adaptador server-side y construir metadata desde sus datos. La URL canónica tendrá el formato:

```text
https://www.jmmcdevsign.es/es/blog/{slug}
```

Los posts inexistentes o no publicados deben producir 404 y no deben generar contenido indexable. La metadata usa `NEXT_PUBLIC_SITE_URL` y el fallback `https://www.jmmcdevsign.es` ya existente en el proyecto.

## Implementation plan

1. Crear o ampliar los tipos editoriales, inputs, estados y validadores del dominio.
2. Implementar el adaptador cliente con persistencia `localStorage`, búsqueda por `slug`, creación, actualización, eliminación, hidratación segura y fallback en memoria.
3. Implementar el adaptador server-side con un borrador editable y tres posts publicados para lectura pública.
4. Añadir fixtures locales de posts y portadas con contenido suficiente para representar la referencia y los estados del editor.
5. Sustituir el panel reducido actual por la composición editorial completa de `resources/04_post_editor`, reutilizando tokens y primitivas existentes.
6. Implementar la barra de comandos, el simulador visible de estados y los indicadores de guardado/publicación.
7. Implementar el canvas de contenido con título, portada, editor Markdown, toolbar, preview, metadatos derivados y estado vacío.
8. Implementar el inspector completo con categoría, tags, slug, resumen, publicación inmediata/programada, telemetría, acceso, derechos y zona crítica.
9. Implementar un renderer Markdown propio limitado a la sintaxis de la toolbar, descartando HTML crudo y esquemas inseguros.
10. Implementar validación accesible para título, slug, categoría, tags, resumen, fecha UTC futura y errores de publicación.
11. Implementar selección y eliminación de portada mediante fixtures locales y modal accesible.
12. Implementar guardar borrador incompleto, autoguardado con debounce de 800 ms, publicación inmediata, programación mock, eliminación y creación de nuevo borrador.
13. Crear `/es/blog/[slug]` como ruta pública server-side para posts publicados, con layout editorial de lectura coherente con el sistema visual.
14. Implementar resolución por `slug`, `notFound` para slug inexistente/no publicado y metadata dinámica con canonical, description y Open Graph.
15. Actualizar los tres enlaces de lectura de la landing para usar los slugs publicados; conservar `/es/blog/editor` para el acceso editorial protegido.
16. Mantener el modelo independiente del proveedor y documentar los puntos de sustitución futura por Supabase Database y Storage.
17. Añadir tests unitarios para modelo, validación, Markdown, telemetría, repositorios, persistencia y resolución por slug.
18. Añadir tests de componentes para editor, inspector, toolbar, preview, modales, estados, autosave, permisos y estado vacío.
19. Añadir tests E2E para edición, recarga, publicación, scheduling, eliminación, ruta pública, metadata, 404, landing, responsive y teclado.
20. Ejecutar las verificaciones completas y eliminar temporales, capturas de trabajo y carpetas de Playwright tras la revisión.

## Acceptance criteria

- [x] `/es/blog/editor` muestra la estructura de `resources/04_post_editor` sin errores de runtime.
- [x] La composición mantiene header, command bar, simulador, canvas, inspector y footer de la referencia.
- [x] El simulador de estados es visible y permite representar edición, guardado, publicación, validación fallida y estado vacío.
- [x] La pantalla conserva la dirección visual de `DESIGN.md`: tipografías, tokens, hairlines, geometría cuadrada, densidad y uso limitado del naranja.
- [x] El editor está protegido para `admin`, `editor` y `revisor`.
- [x] `admin`, `editor` y `revisor` pueden editar, publicar y eliminar en el mock.
- [x] El título, slug, resumen, categoría, tags, portada y cuerpo Markdown son editables.
- [x] La toolbar inserta sintaxis Markdown funcional en el punto de edición.
- [x] El preview representa Markdown permitido sin ejecutar HTML arbitrario ni scripts.
- [x] El repositorio mock persiste los cambios mediante `localStorage` y los recupera tras recargar.
- [x] El repositorio cliente usa una clave estable, valida snapshots corruptos y dispone de fallback en memoria.
- [x] La lectura pública usa un adaptador server-side separado y no depende de `localStorage`.
- [x] Los fixtures iniciales incluyen un borrador editable y tres posts publicados.
- [x] Los componentes no acceden directamente a `localStorage`, fixtures ni Supabase.
- [x] Guardar borrador incompleto actualiza el repositorio y muestra un estado de sincronización mock.
- [x] El autoguardado espera 800 ms de inactividad, persiste solo documentos válidos y muestra su estado.
- [x] La publicación inmediata valida el documento y lo cambia a `published`.
- [x] La publicación programada usa un campo etiquetado como UTC, exige una fecha futura y guarda `scheduledAt` sin ejecutar jobs reales.
- [x] La validación detecta título vacío, slug inválido, categoría vacía, ausencia de tags, resumen superior a 160 caracteres y fecha programada inválida.
- [x] El slug manual solo acepta `a-z`, números y guiones simples, sin normalización automática.
- [x] La portada se puede reemplazar desde fixtures locales y eliminar desde la interfaz.
- [x] La eliminación requiere confirmación accesible y lleva al estado vacío.
- [x] El estado vacío permite crear o recuperar un nuevo borrador.
- [x] El inspector muestra telemetría derivada de Markdown sin llamadas de analytics.
- [x] El acceso y los derechos se muestran como metadatos mock con valores definidos por contrato.
- [x] Existe la ruta pública `/es/blog/[slug]`.
- [x] Un post publicado se puede leer sin autenticación mediante `/es/blog/{slug}`.
- [x] La página pública no expone borradores, posts en revisión ni posts programados no publicados.
- [x] Un slug inexistente o no publicado devuelve 404.
- [x] La página pública genera `title`, `description`, canonical y Open Graph desde el post.
- [x] La URL canónica usa `https://www.jmmcdevsign.es/es/blog/{slug}`.
- [x] Los tres enlaces de lectura pública de la landing apuntan a sus slugs publicados y no a `/es/blog/editor`.
- [x] La publicación local del editor no se presenta como sincronizada con la ruta SSR pública.
- [x] El contrato de repositorio permite sustituir el mock por Supabase sin modificar la UI.
- [x] El renderer Markdown propio no introduce dependencias nuevas y descarta HTML crudo y esquemas inseguros.
- [x] No hay llamadas remotas, migraciones, jobs reales ni credenciales Supabase activas.
- [x] La interfaz es usable a 375px y 1440px.
- [x] El inspector se puede abrir y cerrar en móvil sin bloquear el contenido.
- [x] La navegación por teclado, foco visible, nombres accesibles, `aria-live` y diálogos funcionan correctamente.
- [x] Las transiciones respetan `prefers-reduced-motion`.
- [x] Existen tests unitarios para modelo, validación, telemetría, Markdown, repositorio y slug.
- [x] Existen tests de componentes para editor, inspector, preview, toolbar, estados, modales y estado vacío.
- [x] Existen tests E2E para edición, persistencia, publicación, scheduling, eliminación, lectura pública, SEO y 404.
- [x] `pnpm lint` pasa.
- [x] `pnpm typecheck` pasa.
- [x] `pnpm test` pasa.
- [x] `pnpm build` pasa.
- [x] `pnpm test:e2e` pasa.
- [x] Los temporales, capturas de trabajo y carpetas de Playwright se eliminan tras la verificación.

## Notas de verificación

- Dictamen independiente: `APPROVED`.
- Evidencia: `pnpm lint`, `pnpm typecheck`, `pnpm test` (31 archivos / 102 tests), `pnpm build`, `pnpm test:e2e` (104 tests), `openspec validate post-editor` y Playwright MCP en 1440px/375px.
- El verificador no modificó código de producción, tests ni tareas OpenSpec.

## Decisions

- **Sí:** mantener `/es/blog/editor` como superficie editorial protegida y crear `/es/blog/[slug]` como superficie pública de lectura. El editor no debe ser la URL SEO del artículo.
- **Sí:** tratar editor, persistencia local, ruta pública, SEO y tests como un único change integrado con dos capacidades OpenSpec.
- **Sí:** usar `slug` como identificador público y como parte de la URL canónica. Permite enlaces legibles, metadata estable y futura resolución directa desde Supabase.
- **Sí:** permitir lectura anónima de posts publicados. La indexación SEO requiere una página pública sin login.
- **Sí:** ocultar drafts, revisión y programación no publicada de la ruta pública. Un estado editorial no publicado no debe filtrarse como contenido público.
- **Sí:** mantener una única pieza activa en el editor. No se añade un listado que no aparece en `resources/04_post_editor`.
- **Sí:** conservar el simulador de estados visible. Es parte de la referencia y permite verificar estados mock sin herramientas externas.
- **Sí:** persistir mediante `localStorage` detrás de un repositorio. Reproduce el autoguardado sin acoplar la UI al almacenamiento.
- **Sí:** separar el repositorio cliente de `localStorage` del repositorio server-side de fixtures publicados. La publicación local no actualiza el contenido público hasta contar con almacenamiento compartido.
- **Sí:** mantener un borrador editable y tres posts publicados en los fixtures iniciales; la UI editorial sigue mostrando una única pieza activa.
- **Sí:** almacenar Markdown y construir un preview seguro. Evita añadir un editor WYSIWYG y facilita la futura persistencia en Supabase.
- **Sí:** usar un renderer Markdown propio y limitado, sin dependencias nuevas; el HTML crudo y los esquemas inseguros se descartan.
- **Sí:** permitir guardar borradores incompletos, pero exigir validación para publicar/programar y para el autoguardado.
- **Sí:** usar debounce de 800 ms para el autoguardado y editar el slug manualmente con validación estricta.
- **Sí:** introducir las fechas programadas como UTC explícito y persistirlas en ISO con `Z`.
- **Sí:** enlazar las tres tarjetas editoriales existentes a sus posts públicos; el enlace de acceso de miembros conserva `/es/blog/editor`.
- **Sí:** usar fixtures de portada locales. La futura sustitución por Storage queda limitada al adaptador de assets.
- **Sí:** mantener `review` en el contrato por compatibilidad con el modelo actual, aunque no se añade una acción específica de revisión en esta spec.
- **Sí:** generar metadata dinámica desde el post y conservar `NEXT_PUBLIC_SITE_URL` como base de la canonical.
- **No:** conectar Supabase, crear migraciones, aplicar RLS o implementar Storage real en esta fase.
- **No:** exponer un borrador o un post programado antes de que alcance `published`.
- **No:** añadir un WYSIWYG, colaboración multiusuario, comentarios reales o una bandeja multi-post.

## Risks

| Risk | Mitigation |
| --- | --- |
| La referencia contiene más campos que el modelo actual | Ampliar el contrato manteniendo el repositorio independiente del proveedor y cubrirlo con tests. |
| El preview Markdown podría permitir XSS | Limitar la representación a Markdown permitido y no ejecutar HTML arbitrario. |
| `localStorage` puede estar corrupto o no disponible | Validar el snapshot, restaurar fixtures seguros y mantener fallback en memoria. |
| La publicación programada podría confundirse con una tarea real | Etiquetarla como mock y no ejecutar workers, cron ni requests remotas. |
| Un post no publicado podría filtrarse por slug | Resolver públicamente solo posts `published` y cubrir drafts/scheduled con E2E negativo. |
| El slug puede cambiar después de publicar | Mantener esta fase sin redirecciones históricas; documentar redirects/slugs inmutables para una spec SEO posterior. |
| La composición densa puede romperse en móvil | Usar inspector colapsable, probar 375px y comprobar teclado/scroll. |
| La URL pública puede divergir de los enlaces de landing | Actualizar enlaces de lectura y añadir regresión E2E sobre el href público. |
| El editor local y la ruta pública pueden mostrar estados distintos | Documentar la separación de adaptadores y probar por separado la publicación local y la lectura de fixtures publicados. |
| El autoguardado puede persistir documentos incompletos o generar demasiados eventos | Aplicar debounce de 800 ms, validar antes de persistir y cubrir timers con tests deterministas. |

## What is **not** in this spec

- Supabase Database, Auth, Storage, migraciones o RLS.
- Jobs reales de publicación programada.
- CMS multi-post o listado editorial.
- Colaboración en tiempo real.
- Comentarios, moderación o analítica real.
- Subida de archivos a un proveedor remoto.
- Redirecciones históricas de slugs.
- Sitemap, feed RSS y estrategia SEO global del sitio.
- Internacionalización de rutas fuera de `/es/`.
- Sincronización server-side de publicaciones realizadas solo en `localStorage`.
- Despliegue o cambios en producción.
