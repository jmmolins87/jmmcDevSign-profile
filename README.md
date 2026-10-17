# JMMC portfolio — `jmmcdevsign.es`

Full-stack portfolio: 9-screen web experience (`apps/web`, Next.js App Router +
GSAP/Lenis) behind a Fastify API (`apps/api`) with Postgres (Supabase), Redis
queues and realtime. Monorepo managed with **pnpm workspaces + Turborepo**.

Domain **`jmmcdevsign.es`** · contact **`hola@jmmcdevsign.es`** (see `AGENTS.md`).

## Prerequisites

- Node.js **24 LTS** (`.nvmrc`) — `corepack` is not used since Node ≥ 24.4
  doesn't bundle it; install pnpm with the exact version pinned in
  `package.json` → `packageManager` field: **12.6.0**
- pnpm 12.6.0 (`pnpm install -g pnpm@12.6.0`)
- Docker Desktop (Redis + Mailpit locally)
- Supabase CLI ≥ 2.118 (local Postgres)

## Structure

```
apps/
  web/            Next.js (App Router) — all screens and UI (@jmmcdev/web)
  api/            Fastify API + WebSockets (@jmmcdev/api)
packages/
  shared/         Zod schemas, TS types, event names (@jmmcdev/shared)
  tokens/         design tokens — 3 modes via data-theme (@jmmcdev/tokens)
  emails/        React Email templates (placeholder for spec 02/03)
supabase/         Supabase CLI local config (config.toml)
docker-compose.yml redis + mailpit for local dev
tests/e2e/        Playwright smoke (requires `pnpm dev` running)
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Boots **web (:3000) and api (:4000)** concurrently via turbo |
| `pnpm build` | Builds web, shared and api |
| `pnpm lint` | Biome (lint + format check) |
| `pnpm stylelint` | CSS/tokens lint |
| `pnpm typecheck` | tsc strict across the workspace |
| `pnpm test` | Vitest unit tests **with coverage gate 80/80/80/80** |
| `pnpm test:e2e` | Playwright smoke (needs `pnpm dev` running first) |
| `pnpm db:migrate` | Applies Drizzle migrations (Supabase local → prod later) |
| `pnpm db:seed` | Loads deterministic mock data into every §6 table |

## Local services

1. **Postgres (Supabase CLI):**

   ```bash
   supabase start          # isolated stack on 127.0.0.1:54322
   ```

   Connection string (already set in `.env.example`): 
   `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

2. **Redis + Mailpit (Docker Compose):**

   ```bash
   docker compose up -d    # redis :6379, mailpit UI :8025 (:1025 SMTP)
   ```

3. **Env vars:** `cp .env.example .env` and fill the secrets you need for your
   phase; every variable is documented inline in `.env.example` (§12 varies
   per screen spec — variables marked server-only must never reach the browser).
   The API validates its env on boot and refuses to start with a broken setup.

4. **Database schema + mock data:**

   ```bash
   pnpm db:migrate  # Drizzle migrations under apps/api/src/db/migrations
   pnpm db:seed     # fills all 18 tables; is the ONLY mock data source
   ```

   Schema changes happen **only** through Drizzle migrations committed to the
   repo. The Supabase MCP stays read-only (advisors/logs/debug), it must never
   change the schema — the database cannot drift from released code.

5. **Health checks:** api `/health` → 200; auto-generated OpenAPI at `/docs`.

## Agent tooling (MCP)

Configured in **`opencode.json`** (committed, **without secrets** — tokens live
in your environment or OpenCode auth store, never in git):

| MCP | Purpose | Enabled by default |
| --- | --- | --- |
| Stitch | Read the 9 screens from the project | false |
| Supabase | Read-only DB inspection/advisors | false |
| GitHub | Issues/PRs/CI | true |
| Context7 | Library docs | true |
| Playwright | UI flows during dev | true (local) |
| Vercel | Deploy/build logs of web | false |

Enable only the servers your current phase needs; keep the rest `enabled: false`
to save model context.

## CI

`.github/workflows/ci.yml` runs on every PR: install → lint → stylelint →
typecheck → unit tests with the coverage gate → build. No unit test touches
Postgres/Redis/Mailpit. Playwright smoke runs locally before merge.

Deployment (Vercel for web, Railway for api + Redis) is prepared in
`docs/deployment.md` and its configs (`apps/web/vercel.json`,
`apps/api/railway.json`) but **dormant** — nothing deploys without explicit
human approval.
