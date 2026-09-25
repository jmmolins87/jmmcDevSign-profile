# SPEC 03 — Backend Supabase con mocks y preconfiguración Vercel

> **Status:** Aprobado
> **Depends on:** SPEC 01, SPEC 02
> **Date:** 2026-09-25
> **Objective:** Dejar preparada la infraestructura de datos con Supabase para imágenes y blog, con variables de entorno y despliegue Vercel documentados, funcionando con mocks hasta la conexión final.

## Por qué existe esta spec

Las imágenes van por hotlink y el blog es contenido hardcodeado. El destino final es Supabase como backend y Vercel como despliegue. Hace falta montar ahora la capa de datos con su interfaz, el cliente, el esquema y las variables de entorno, para que el corte a datos reales sea cambiar una env var y no una refactorización.

## Alcance

**In:**

- Dependencia `@supabase/supabase-js` + helper `lib/supabase/client.ts` que lee la env y falla en claro si falta en modo `supabase`.
- Capa `lib/data/` con tipos `Post` y `SiteImage`, implementación mock (`lib/data/mock.ts` con los datos actuales) y selector por `DATA_SOURCE` (`mock` por defecto, `supabase` para el corte).
- Migración de `Hero`, `About`, `Projects` (imágenes) y `Blog` (posts) a leer de `lib/data/`, sin cambio visual.
- `.env.example` commiteado + `.env.local` local con placeholders (nunca commiteado).
- Esquema SQL versionado en `supabase/schema.sql` (tablas `posts` e `images`) listo para aplicar vía MCP.
- Conexión del proyecto Supabase vía MCP y smoke test de lectura.
- Tabla en esta spec con las variables a configurar en el dashboard de Vercel.

**Fuera de alcance (specs futuras):**

- Contenido real cargado en Supabase (posts e imágenes de producción).
- Aplicar RLS fina más allá del SQL preparado, triggers o storage buckets.
- Conexión del proyecto en Vercel y despliegue (spec de corte final).
- Migrar el resto de dominios (stack, timeline, proyectos, servicios, demos), que siguen en `lib/content.ts`.
- Pantallas 01b y 02–06.

## Modelo de datos

Tablas nuevas en Supabase (definidas en `supabase/schema.sql`, sin datos reales aún):

```sql
-- posts: artículos del blog
-- id uuid pk, slug text unique, category text, title text,
-- excerpt text, body text, reading_minutes int,
-- published_at timestamptz, cover_image_id uuid fk
-- images: medios del sitio
-- id uuid pk, key text unique, url text, alt text, width int, height int
```

Tipos TS en `lib/data/types.ts` que espejan esas tablas:

```ts
export type Post = { slug: string; category: string; title: string; excerpt: string; readingMinutes: number; publishedAt: string; cover: SiteImage };
export type SiteImage = { key: string; url: string; alt: string };
```

Convención: los mocks de `lib/data/mock.ts` reutilizan los valores actuales de `lib/content.ts` marcados `[placeholder]`. `DATA_SOURCE` solo admite `mock` o `supabase`.

## Plan de implementación

1. **Entorno y cliente.** Instalar `@supabase/supabase-js`, crear `.env.example`, `.env.local` con placeholders y `lib/supabase/client.ts`. *Verificar:* `npx tsc --noEmit` pasa y `.env.local` no está trackeado por git.
2. **Capa de datos.** Crear `lib/data/types.ts`, `lib/data/mock.ts` (posts e imágenes actuales) y el selector por `DATA_SOURCE`. *Verificar:* `npx tsc --noEmit` pasa.
3. **Cableado.** Migrar `Hero`, `About`, `Projects` y `Blog` a `lib/data/`. *Verificar:* `npm run build` termina sin errores y ningún grep encuentra URLs de hotlink fuera de `lib/data/mock.ts`.
4. **Supabase vía MCP.** Seleccionar o crear el proyecto, aplicar `supabase/schema.sql` y hacer un smoke test de lectura (la UI sigue en modo `mock`). *Verificar:* las tablas `posts` e `images` existen vacías en el proyecto.
5. **QA y docs.** Capturar las 4 secciones tocadas a 1440px en `.playwright-mcp/03-backend-supabase-mocks/after/` vs las de SPEC 02, y ejecutar `npm run lint` y `npx tsc --noEmit`. *Verificar:* cero diferencias visuales y cero errores.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `Hero`, `About`, `Projects` y `Blog` importan de `lib/data/` y ningún otro componente lo hace.
- [ ] Con `DATA_SOURCE` ausente la web funciona en modo `mock` con contenido idéntico al actual.
- [ ] `supabase/schema.sql` existe y las tablas `posts` e `images` están creadas vacías en el proyecto.
- [ ] `.env.local` no aparece en `git status` y `.env.example` lista las variables sin valores reales.
- [ ] Las capturas `after/` no muestran diferencias respecto a las de SPEC 02.

## Decisiones

- **Sí:** solo imágenes y blog van a Supabase. **No:** migrar stack, timeline, proyectos, servicios ni demos, que son estáticos y ya funcionan.
- **Sí:** capa `lib/data/` con interfaz + mock conmutable por `DATA_SOURCE`. **No:** mocks inline en componentes, que harían el corte invasivo.
- **Sí:** `.env.example` commiteado y `.env.local` ignorado. **No:** valores reales en el repo.
- **Sí:** instalar `@supabase/supabase-js` y el helper ya, aunque tire de mocks. **No:** esperar al proyecto real.
- **Sí:** preparar Vercel solo con documentación de variables en esta spec. **No:** conectar ni desplegar ahora.
- **Sí:** operaciones Supabase vía MCP. **No:** SQL manual fuera del repo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Crear o elegir proyecto Supabase requiere decisiones (org, región, plan) no tomadas | El paso 4 se detiene y pide checkpoint antes de crear nada con coste |
| La env var `DATA_SOURCE` llega a leerse en cliente con valor incorrecto | Valores admitidos solo `mock`/`supabase`; cualquier otro cae a `mock` con aviso en consola |
| Fuga de secretos al repo | `.env.local` en `.gitignore`; la aceptación lo verifica con `git status` |

## Variables para el dashboard de Vercel (spec de corte)

| Variable | Alcance | Valor |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | anon key pública del proyecto |
| `DATA_SOURCE` | Production | `supabase` (en local y Preview: `mock` hasta el corte) |

## Lo que **no** está en esta spec

- Datos reales en Supabase, RLS fina, buckets de storage y deploy en Vercel.
- Migrar dominios fuera de imágenes y blog, y pantallas 01b y 02–06.
- Ningún cambio visual en las 4 secciones tocadas.
