# Deployment plan (dormant — spec 00)

These configs exist in-repo but **no deployment has been executed** as part of
spec 00. Deployment is a manual, user-approved step handled by a later spec.

## apps/web → Vercel

1. Import the repo into Vercel; set the **Root Directory** to `apps/web`
   (package `@jmmcdev/web`).
2. `apps/web/vercel.json` pins install/build/dev commands for the monorepo.
3. Variables §12 for web: `WEB_URL`, `API_URL` (public), and nothing server-only.
4. Domains: `jmmcdevsign.es` (+ `www`). DNS is user-managed.

## apps/api → Railway

1. Create a Railway project; connect the repo; the service reads
   `apps/api/railway.json` (NIXPACKS build → `node dist/server.js`).
2. Attach a **Redis** instance in the same project; expose `REDIS_URL` to the
   app (Railway private network).
3. Variables §12 for the API: `DATABASE_URL` (Supabase prod), `REDIS_URL`,
   `WEB_URL=https://jmmcdevsign.es`, `API_URL`, `BETTER_AUTH_SECRET`,
   `APPROVAL_TOKEN_SECRET`, OAuth client id/secret pairs, `RESEND_API_KEY`,
   `MAIL_FROM=hola@jmmcdevsign.es`, `ADMIN_EMAIL=hola@jmmcdevsign.es`,
   `AI_*`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only),
   `SUPABASE_STORAGE_BUCKET`.
4. `/health` is the Railway healthcheck (200 when the API boots).

## Postgres → Supabase (hosted)

One dev project + one prod project. Migrations through `pnpm db:migrate`
(Drizzle only). The Supabase MCP stays **read-only** so the database never
drifts from the committed Drizzle schema.

## CI gate

`.github/workflows/ci.yml` runs on every PR: install → lint → stylelint →
typecheck → unit tests with coverage (>80% all four metrics) → build.
The workflow never touches the live services; deployments require the manual
steps above.
