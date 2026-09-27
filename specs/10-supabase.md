# SPEC 10 — Supabase real: blog bilingüe, usuarios con roles, Storage e i18n ES/EN

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 03, SPEC 05, SPEC 08, SPEC 09
> **Date:** 2026-09-27
> **Objective:** Cortar todo el contenido del sitio a Supabase real (blog bilingüe ES/EN, imágenes en Storage, usuarios con roles vía Auth) e implementar el i18n ES/EN de todo el sitio con prefijo `/en/*`, manteniendo el selector `DATA_SOURCE` y los mocks de las demos.

## Por qué existe esta spec

La SPEC 03 dejó la capa `lib/data/` lista con mocks y el esquema SQL preparado, pero sin datos reales; la SPEC 08 dejó el auth como mock visual; la SPEC 09 dejó el editor en `useState` sin persistencia. El destino es Supabase como backend único del contenido (blog, imágenes, usuarios, roles) manteniendo los textos de la UI hardcodeados en diccionarios de traducción del repo, y sirviendo el sitio completo en español e inglés. Esta spec es el corte: conecta lo que las specs anteriores dejaron preparado.

## Alcance

**In:**

- **Esquema real (amplía `supabase/schema.sql` de SPEC 03):** tablas `profiles` (rol `admin`/`author`), `posts` (base sin textos), `post_translations` (una fila por locale: `title`, `excerpt`, `body`, `reading_minutes`), `images` (con `storage_path`). Se reemplaza el modelo `posts` con columnas planas de la SPEC 03. Migración SQL aplicada vía MCP.
- **Auth real** con `@supabase/ssr`: sesión en middleware + server components, login/registro en `/zona-miembros` (reemplaza el mock de SPEC 08), rol `author` por defecto en registro abierto, usuario admin sembrado. Redirect post-login a `/blog/editor` si tiene sesión; guard de ruta en `/blog/editor`.
- **RLS:** lectura pública de `posts` publicados + `images`; escritura de posts/translations solo `admin`/`author`; `profiles` solo legible por el propio usuario.
- **Blog real:** la capa `lib/data/` lee/escribe Supabase cuando `DATA_SOURCE=supabase`; seed con los posts actuales de `lib/data/mock.ts` en ES **y** EN; `/en/blog` con fallback a ES si falta traducción; `hreflang` en posts.
- **Editor conectado (SPEC 09):** `/blog/editor` pasa de `useState` a leer/crear/actualizar posts + `post_translations`, con selector de idioma ES/EN real y subida de portada a Storage.
- **Storage:** bucket público `site-images`; migración de los hotlinks de SPEC 01 (hero, proyectos, about, portadas) descargándolos y subiéndolos; tabla `images` poblada. Fallback: si un hotlink no se puede descargar, se conserva la URL externa en `images.url`.
- **i18n de todo el sitio:** diccionarios `messages/es.json` + `messages/en.json` en el repo; middleware con rewrite `/en/*` → ruta interna + header `x-locale`; helper server `t(locale, key)` + provider client; strings de landing, menú overlay, footer, demos, zona de miembros y blog UI migrados a diccionarios. Rutas ES en `/`, EN en `/en/...`.
- **Mantenimiento de mocks:** `DATA_SOURCE` sigue `mock|supabase`; con `mock` la web funciona exactamente igual que hoy. Los datos de las demos (leads, pedidos, gestión) siguen mock siempre.
- **Verificación:** `npm run build`, `npm run lint`, `npx tsc --noEmit`; capturas Playwright 1440px/390px de landing + blog + editor en ES y EN en `.playwright-mcp/10-supabase/after/`; smoke test con `DATA_SOURCE=mock` sin regresiones.

**Fuera de alcance (specs futuras):**

- Datos de las demos (`lib/data/leads.ts`, `orders.ts`, `software.ts`) a Supabase.
- Formulario de contacto real (envío de email), newsletters, comentarios.
- Publicación programada real (el módulo de scheduling de SPEC 09 sigue inerte).
- Dashboard post-login (lista de posts, perfil) — solo redirect al editor.
- Recuperación de contraseña, email templates, confirmación de email (ver decisión pendiente).
- Despliegue en Vercel y corte de env vars de producción (spec de corte final de SPEC 03).
- Localización de imágenes por idioma (una URL sirve para ES y EN).

## Modelo de datos

```sql
-- profiles: usuarios autenticados
-- id uuid pk references auth.users, email text, display_name text,
-- role text check (role in ('admin','author')) default 'author'
-- posts: base compartida entre idiomas
-- id uuid pk, slug_base text unique, category text,
-- cover_image_id uuid fk images, status text ('draft'|'published'),
-- published_at timestamptz, created_by uuid fk profiles
-- post_translations: un registro por post + locale
-- post_id uuid fk posts, locale text check in ('es','en'),
-- title text, excerpt text, body text, reading_minutes int,
-- unique (post_id, locale)
-- images: medios (Storage o hotlink de fallback)
-- id uuid pk, key text unique, storage_path text null, url text,
-- alt text, width int, height int
```

```ts
// lib/data/types.ts (evolución del tipo de SPEC 03)
export type Locale = "es" | "en";
export type PostTranslation = { locale: Locale; title: string; excerpt: string; body: string; readingMinutes: number };
export type Post = {
  slugBase: string;                 // "disenar-con-codigo-..."
  category: string;
  status: "draft" | "published";
  publishedAt: string;
  cover: SiteImage;
  translations: Partial<Record<Locale, PostTranslation>>; // fallback a "es"
};
export type Profile = { id: string; email: string; role: "admin" | "author" };
```

```jsonc
// messages/es.json y messages/en.json (diccionarios en repo)
{ "nav": { "work": "Proyectos", ... }, "hero": { ... }, "footer": { ... } }
```

Convención: slugs EN con sufijo `-en` (`/en/blog/<slug>-en`); si no hay traducción, `/en/blog/<slug>` renderiza ES marcado con aviso visual `Idioma no disponible — mostrando ES`.

## Plan de implementación

1. **Esquema v2.** Ampliar `supabase/schema.sql` con `profiles`, `post_translations` y `images.storage_path`; aplicar vía MCP; crear bucket `site-images`. *Verificar:* tablas creadas y smoke test de lectura con SQL.
2. **Auth helpers.** Instalar `@supabase/ssr`; crear `lib/supabase/server.ts` y `lib/supabase/middleware.ts`; integrar sesión en el middleware (junto al rewrite de locale). *Verificar:* `npx tsc --noEmit` pasa; el middleware no rompe rutas existentes.
3. **RLS + seed de usuario admin.** Policies de lectura pública y escritura por rol; seed del usuario admin. *Verificar:* con anon key no se puede insertar un post; con sesión admin sí.
4. **Zona de miembros real.** Reemplazar el mock de SPEC 08: login + registro (rol `author`), sesión persistente, estado "sesión activa" + cerrar sesión, redirect a `/blog/editor` con sesión; sin sesión el editor redirige a `/zona-miembros`. *Verificar:* registro → login → redirect; logout limpia sesión.
5. **Infra i18n.** Middleware: rewrite `/en/*` → ruta interna + header `x-locale`; helper `t()` server y `useT()` client; crear `messages/es.json` y `messages/en.json` con las claves de la landing. *Verificar:* `/en/` devuelve la landing; el ES en `/` no cambia.
6. **Traducción de la UI.** Migrar strings de landing, menú overlay, footer, `/demos/*`, `/zona-miembros` y blog UI a los diccionarios (EN escrito en el mismo paso). *Verificar:* grep de strings hardcodeados fuera de `messages/` solo en datos mock de demos; `/en/*` muestra textos EN en todas las secciones.
7. **Blog real en capa de datos.** Implementar selector supabase en `lib/data/` para posts (join `posts` + `post_translations`); seed de los posts actuales ES+EN; páginas de blog con fallback ES y `hreflang`. *Verificar:* con `DATA_SOURCE=supabase` la sección blog pinta posts de la BD; `/en/blog` muestra EN y fallback donde no hay.
8. **Migración de imágenes.** Descargar hotlinks de `lib/data/mock.ts`, subirlos a `site-images`, poblar `images`; los componentes usan `url` de la BD en modo supabase. *Verificar:* con `DATA_SOURCE=supabase` no queda ningún hotlink en el DOM salvo fallbacks documentados.
9. **Editor conectado.** `/blog/editor` lee/guarda posts y traducciones con selector ES/EN, sube portada a Storage, respeta `status`; publicar escribe `published_at`. *Verificar:* crear post en ES desde el editor aparece en la sección blog al recargar; recargar el editor conserva lo guardado.
10. **QA final.** `npm run build`, `npm run lint`, `npx tsc --noEmit`; capturas Playwright 1440px/390px de landing, blog y editor en ES y EN en `.playwright-mcp/10-supabase/after/`; smoke `DATA_SOURCE=mock`. *Verificar:* cero errores y cero regresiones visuales.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] Con `DATA_SOURCE=mock` la web se ve idéntica a hoy (sin regresiones).
- [ ] Con `DATA_SOURCE=supabase` la sección blog pide los posts a la BD (verificable en Network).
- [ ] Tablas `profiles`, `posts`, `post_translations`, `images` existen con RLS activo (anon no puede escribir).
- [ ] Registro en `/zona-miembros` crea usuario con rol `author`; existe sesión iniciada tras login.
- [ ] Con sesión, `/blog/editor` carga; sin sesión, redirige a `/zona-miembros`.
- [ ] Login redirige a `/blog/editor`; hay botón de cerrar sesión que limpia la sesión.
- [ ] El editor guarda un post y sus traducciones; recargar lo muestra igual (persistencia real).
- [ ] El editor permite subir una portada a Storage y la imagen aparece en el post.
- [ ] `/en/*` renderiza la misma página en inglés (landing, blog, demos, zona de miembros); `/` sigue en español.
- [ ] Un post seedeado en ES+EN se sirve en su idioma en `/blog/...` y `/en/blog/...` con `hreflang`.
- [ ] Un post sin traducción EN en `/en/blog/<slug>` muestra el contenido ES con aviso de fallback (no 404).
- [ ] No queda ningún string de UI hardcodeado fuera de `messages/*.json` (los datos mock de demos no cuentan).
- [ ] Con `DATA_SOURCE=supabase`, las imágenes del sitio se sirven de `site-images` en Storage.
- [ ] Capturas Playwright 1440px/390px ES y EN en `.playwright-mcp/10-supabase/after/`.
- [ ] Todo contenido de ejemplo/seed marcado `[placeholder]` donde aplique.

## Decisiones

- **Sí:** la 10 extiende la SPEC 03 (capa `lib/data/`, cliente y selector intactos). **No:** reemplazar la 03 — ya está aprobada y su interfaz es exactamente lo que hace falta.
- **Sí:** blog bilingüe con dos registros en BD (`post_translations` por locale). **No:** traducir en tiempo real — el contenido es editorial escrito a mano; traducción en render costaría calidad, latencia y dinero. **No:** columnas dobles ni `jsonb` — dificultan RLS, queries y publicación independiente por idioma.
- **Sí:** diccionarios de UI en el repo (`messages/es.json`/`messages/en.json`), como pediste. **No:** textos de UI en BD — versionar traducciones de nav en git es más simple y revisable.
- **Sí:** prefijo `/en/*` + rewrite en middleware. **No:** `app/[locale]` con next-intl — reestructuraría todo el árbol `app/` de las 9 specs existentes.
- **Sí:** Auth real con `@supabase/ssr` + roles `admin`/`author`. **No:** solo tabla `profiles` sin auth — no tendría sentido con "usuarios vendrán de la bbdd".
- **Sí:** registro abierto con rol `author` por defecto. **No:** solo tu cuenta sembrada ni aprobación manual — más fricción sin pedirla.
- **Sí:** redirect post-login a `/blog/editor`. **No:** dashboard nuevo — pantalla nueva merece otra spec.
- **Sí:** migrar hotlinks a Storage con fallback a URL externa si no se descarga. **No:** `public/` en el repo ni dejar hotlinks caducos.
- **Sí:** mantener `DATA_SOURCE` y los mocks (demos siempre mock). **No:** eliminar mocks — son la red de seguridad para preview y demos.
- **Sí:** fallback a ES con aviso en `/en/blog`. **No:** 404 si falta traducción.
- **Sí:** una sola spec pese a tocar 4+ dominios. **No:** partir en 2-3 specs — lo decidiste en la fase de preguntas; el plan está secuenciado para que cada paso deje el sistema funcional.

**Decisión pendiente (configuración del dashboard, no de código):** confirmación de email en Supabase Auth — recomendación: desactivarla para no requerir SMTP en desarrollo; se confirma al tener acceso al dashboard.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Algún hotlink de SPEC 01 ya no responde al descargarlo | Fallback: `images.url` conserva la URL externa; se documenta en el seed |
| Middleware con doble responsabilidad (locale + sesión) rompe rutas o assets | Excluir `_next` y `public` del rewrite; test manual de `/`, `/en/`, editor y demos en cada paso |
| Cambio de esquema `posts` → `post_translations` rompe la lectura actual | El paso 7 es el único que toca la lectura; mientras tanto `DATA_SOURCE=mock` (default) no se entera |
| Traducciones EN del seed generadas por IA con tono incorrecto | Se marcan `[placeholder]`; revisión humana antes de producción |
| Sesión de `@supabase/ssr` en RSC añade complejidad al primer contacto | Paso 2 aislado con smoke test antes de tocar la UI de la 08 |
| Tamaño de imágenes subidas a Storage | Subir optimizadas (mismo formato que hoy); límite documentado |

## Lo que **no** está en esta spec

- Datos de las demos a Supabase; contacto real; newsletters; scheduling real.
- Dashboard post-login; recuperación de contraseña; email templates.
- Despliegue/Vercel (spec de corte de la SPEC 03).
- Partir el site en múltiples specs — queda como una sola (SPEC 10).
