# JMMC Devsign // Portfolio y demos

Portfolio editorial de JMMC Devsign construido con Next.js 16, React 19,
TypeScript y Tailwind CSS 4. La primera versión usa datos mock locales y deja
la frontera de repositorios preparada para una integración futura con Supabase.

La URL canónica prevista es:

`https://www.jmmcdevsign.es/es/`

## Requisitos

El entorno verificado para esta fase es Node.js `24.22.1` y pnpm `12.18.0`.
El gestor del proyecto está fijado en `package.json`.

Instala dependencias con el lockfile:

```bash
pnpm install --frozen-lockfile
```

## Desarrollo local

```bash
pnpm dev
```

Abre [http://localhost:3000/es/](http://localhost:3000/es/). La aplicación
funciona sin `.env.local` porque las superficies actuales consumen repositorios
mock.

Comandos disponibles:

| Comando | Uso |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo en el puerto 3000. |
| `pnpm lint` | ESLint sobre el proyecto. |
| `pnpm typecheck` | Comprobación TypeScript sin emitir archivos. |
| `pnpm test` | Tests unitarios y de componentes con Vitest. |
| `pnpm test:watch` | Vitest en modo interactivo. |
| `pnpm test:e2e` | Build de producción y E2E Playwright en 375px y 1440px. |
| `pnpm build` | Build de producción Next.js. |
| `pnpm start` | Servidor de producción local. |

Para instalar Chromium una sola vez antes del primer E2E:

```bash
pnpm exec playwright install chromium
```

`test:e2e` levanta un servidor de producción temporal en `127.0.0.1:3099` y
lo detiene al terminar. Los informes, vídeos y capturas de fallo están
ignorados por Git y deben eliminarse después de investigar un fallo.

## Mapa de rutas

| Ruta | Superficie | Acceso |
| --- | --- | --- |
| `/es/` | Presentación editorial del portfolio. | Público |
| `/es/login` | Login, logout y perfiles mock. | Público |
| `/es/admin/approval` | Aprobación de accesos. | `admin` |
| `/es/blog/editor` | Editor y preview de posts. | `admin`, `editor` |
| `/es/demos` | Catálogo de demos. | Público |
| `/es/demos/agent-builder` | Constructor y runtime de agentes. | `admin`, `editor` |
| `/es/demos/leads-workflow` | Workflow de leads. | `admin`, `editor` |
| `/es/demos/lead-qualification` | Cualificación comercial. | `admin`, `editor` |
| `/es/demos/orders-realtime` | Pedidos y eventos realtime mock. | `admin`, `editor`, `lector` |
| `/es/demos/business-backoffice` | Métricas y cola operativa. | `admin` |

Los perfiles disponibles se muestran en `/es/login`. Sus claves son fixtures de
demo, no credenciales reales. La sesión se guarda en `localStorage` únicamente
para permitir probar las rutas protegidas.

## Variables de entorno

Copia el template cuando necesites preparar la integración futura:

```bash
cp .env.example .env.local
```

| Variable | Uso | Obligatoria ahora |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública del proyecto Supabase. | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon/publishable. | No |
| `NEXT_PUBLIC_SITE_URL` | URL canónica del sitio. | No; usa `https://www.jmmcdevsign.es` |

No pongas `service_role`, tokens de administración ni secretos en variables
`NEXT_PUBLIC_*`. La frontera preparada y sus límites están documentados en
[`docs/integrations/supabase.md`](docs/integrations/supabase.md).

## Supabase CLI y MCP

La configuración actual no crea tablas, migraciones, políticas RLS ni consultas
remotas. Estos comandos quedan como referencia para una spec posterior.

Comprobaciones locales del CLI, sin telemetría:

```bash
SUPABASE_TELEMETRY_DISABLED=1 supabase --version
supabase start
supabase status
supabase stop
```

Flujo futuro, solo sobre un proyecto autorizado:

```bash
supabase init
supabase link --project-ref <project-ref>
supabase db diff
supabase db push
supabase gen types --linked --lang=typescript > app/lib/supabase/database.types.ts
```

`supabase db push` y `supabase gen types --linked` pueden afectar o leer un
proyecto remoto; requieren confirmación y credenciales adecuadas. Para generar
tipos sin conexión remota, usa `supabase gen types --local --lang=typescript`.

El servidor Supabase MCP conectado a Codex se puede inspeccionar sin modificar
el proyecto:

```bash
codex mcp list
codex mcp get supabase
```

Las operaciones de base de datos del MCP deben limitarse a lecturas durante
esta spec. No se ejecutaron operaciones remotas en esta fase.

## Despliegue en Vercel

El proyecto no está enlazado ni desplegado automáticamente por esta spec.
Cuando exista un proyecto Vercel autorizado:

```bash
npm i -g vercel
vercel login
vercel link
vercel project inspect --non-interactive
```

En un monorepo se debe evaluar `vercel link --repo`. Antes de cualquier
operación confirma que el proyecto y el equipo devueltos por `vercel project
inspect` son los esperados.

Configura las variables por entorno desde Vercel, sin escribir secretos en el
repositorio:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_SITE_URL production
```

Validación y despliegues:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
vercel deploy
vercel --prod
```

Para un despliegue preconstruido:

```bash
vercel build --prod
vercel deploy --prebuilt --prod
```

`vercel --prod` y `vercel deploy --prebuilt --prod` son operaciones externas y
requieren autorización explícita. En CI usa `VERCEL_TOKEN` mediante el sistema
de secretos del proveedor, nunca en flags ni en archivos versionados.

## Estructura relevante

- `app/es/`: rutas, shell y superficies en español.
- `app/components/ui/`: primitivas accesibles reutilizables.
- `app/es/repositories/`: contratos y repositorios mock observables.
- `app/lib/supabase/`: cliente perezoso, variables y tipos placeholder.
- `tests/`: unitarios y componentes.
- `e2e/`: flujos Playwright en móvil y escritorio.
- `docs/integrations/`: límites y procedimiento de integraciones futuras.
