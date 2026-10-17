# SPEC 00 — Foundation: monorepo, tooling, mock database and quality gates

> **Status:** Implemented
> **Depends on:** none
> **Date:** 2026-10-17
> **Objective:** Transform the current flat Next.js repo into the project's monorepo foundation (structure, tooling, design tokens package, mock-seeded database, testing and CI quality gates) without building any of the 9 screens.

## Why this spec exists

The repo is a plain `create-next-app` (Next 16.4.2, flat `app/`, both `package-lock.json` and `pnpm-lock.yaml`). The project guidelines (`resources/00-JMMC-project-guidelines.md`, §2) require a very different shape: pnpm workspaces + Turborepo, a Fastify API, shared packages, a real database with mock data, and enforced quality gates. Every later screen spec depends on this ground being solid and verifiable, so the foundation is its own spec with its own acceptance criteria.

## Scope

**In:**

- Monorepo conversion: `app/`, `public/` and web config move to `apps/web/`; new `apps/api/` (Fastify skeleton) and `packages/shared/`, `packages/tokens/`, `packages/emails/` (skeletons).
- Single lockfile: pnpm only (`package-lock.json` deleted, `pnpm-lock.yaml` is the source of truth, exact versions pinned via `packageManager`).
- Root tooling: Biome (lint + format), Stylelint (CSS), lefthook (lint + typecheck on commit), Conventional Commits, Node version pinned (`.nvmrc` + engines, Active LTS 24).
- `packages/tokens`: the design-token CSS variables (Oscuro default, Claro, Sistema) derived from `resources/brutalist_editorial_architecture/DESIGN.md`, applied via `data-theme="dark|light|system"` convention. Token-level only; no visual components.
- `packages/shared`: Zod environment schemas, API/domain types and Socket.IO event names/constants (guidelines §7). Schemas only; endpoints using them later.
- `apps/api`: Fastify + TypeScript skeleton with Zod env validation, helmet, CORS restricted to the web origin, rate limiting, `/health` route, auto-generated OpenAPI served at `/docs`.
- Database: Drizzle ORM with schema v1 covering **all domains from guidelines §6**, a versioned migration, and a seed script loading realistic mock data. Local Postgres via Supabase CLI (`supabase start`); Redis + Mailpit via `docker-compose.yml`. Single data path: seed → DB → API endpoints (no in-memory mock mode).
- Tests: Vitest with coverage thresholds **> 80% in statements, branches, functions and lines** (cumulative, from this first commit), plus Playwright smoke e2e (app boots, placeholders render).
- CI: GitHub Actions workflow on every PR (install, lint, stylelint, typecheck, test with coverage, build). Deployment configs (Vercel for `apps/web`, Railway for `apps/api` + Redis) **prepared but not executed**.
- Docs/data: `AGENTS.md` gains the domain block (domain `jmmcdevsign.es`, contact email `hola@jmmcdevsign.es`); `.env.example` with all §12 variables including `WEB_URL=https://jmmcdevsign.es`, `MAIL_FROM=hola@jmmcdevsign.es`, `ADMIN_EMAIL=hola@jmmcdevsign.es`; README documents structure, scripts and MCP setup; `opencode.json` committed without secrets (§14).

**Out of scope (for future specs):**

- Any of the 9 screens' UI (landing, auth modal, editor, demos) — hero, GSAP/ScrollTrigger/Lenis/ogl motion, section visuals: SPEC 01+.
- UI foundation kernel from §10 step 0 beyond dependencies: theme switcher wiring, loader, header, full-screen menu, i18n wiring (ES/EN messages), base components — SPEC 01.
- Better Auth: registration, approval flow, OAuth, sessions — SPEC for screens 02/03.
- Email sending (Resend) and the Admin Approval Email template — `packages/emails` only gets its dependency.
- AI SDK integration (demos 05/07).
- Deployment execution: Vercel/Railway projects, env secrets, DNS of `jmmcdevsign.es` — later spec.
- Supabase Storage wiring for uploads.
- Socket.IO event traffic (only the shared event names live in `packages/shared`).

## Data model

Schema v1 (Drizzle, files under `apps/api/src/db/`), all domains from guidelines §6:

- `users`, `accounts`, `sessions`, `approval_requests` — auth domain.
- `posts`, `contact_messages` — content domain.
- `agents`, `agent_messages` — demo 05.
- `leads`, `followup_steps` — demos 06/07.
- `orders`, `order_items`, `order_events` — demo 08.
- `shops`, `customers`, `products`, `invoices`, `audit_log` — demo 09.

Conventions:

- UUID primary keys (`gen_random_uuid()`), `snake_case` column names, `timestamptz` timestamps with `created_at`/`updated_at`.
- Postgres enums via `pgEnum` (e.g. `user_status`, `post_status`, `lead_status`, `order_status`).
- Migrations versioned and committed under `apps/api/src/db/migrations/` via `pnpm db:migrate`; seed at `apps/api/src/db/seed.ts` run by `pnpm db:seed`.
- The seed is the only mock data source; it must end with every table populated (`select count(*)` → 0 rows is a seed failure).

This feature introduces no other persistent data structures (no localStorage, no storage buckets yet).

## Implementation plan

1. Create `specs/00-foundation.md` (this spec) and seed `specs/.spec-config.yml`.
2. Monorepo restructure: `git mv` of `app/`, `public/`, `next.config.ts`, `tsconfig.json` into `apps/web/`; create `pnpm-workspace.yaml`, `turbo.json`, root `package.json` scripts (`dev`, `build`, `lint`, `typecheck`, `stylelint`, `test`, `db:migrate`, `db:seed`) with `packageManager` pinned to the exact pnpm version; delete `package-lock.json`, `.next/`, `eslint.config.mjs`. Verify: `pnpm install && pnpm build` leaves apps/web buildable.
3. Tooling: add `biome.json`, `stylelint.config.js`, `lefthook.yml`, root devDependencies. Verify: `pnpm lint` and `pnpm stylelint` pass on the moved code.
4. `packages/tokens`: `tokens.css` with the 3 modes (YAML from DESIGN.md audited against guidelines §8; missing `accent: #FF5A1F` added explicitly) + `README.md` documenting the `data-theme` convention. `apps/web` imports it in its placeholder layout. Verify: the placeholder page renders with the variables present.
5. `packages/shared`: `src/env.ts` (Zod env schema), `src/api.ts` (shared contracts), `src/events.ts` (socket event names + constants). Verify: `pnpm typecheck` passes with packages importing them.
6. `apps/api` skeleton: Fastify server (`src/server.ts`), Zod-validated env, helmet + CORS + rate-limit, `/health`, OpenAPI generated at `/docs`; root `docker-compose.yml` with redis + mailpit. Verify: `docker compose up -d` then `pnpm dev` exposes `/health` (200) and `/docs` (HTML).
7. Database: Drizzle schema v1 (all §6 tables), migration `0001`, `db:seed` with realistic mock data, Supabase CLI config (`supabase/`), root scripts `db:migrate`/`db:seed` wired. Verify: `supabase start && pnpm db:migrate && pnpm db:seed` populates all tables; killing Supabase and restarting preserves migrations.
8. Tests: Vitest `workspace.yml` + per-package configs with coverage thresholds 80/80/80/80 (include `apps/*/src` + `packages/*/src`, exclude mocks, config, types, generated files); Playwright config + `smoke.spec.ts`; first unit tests (env validation, shared schemas, an API route). Verify: `pnpm test` — fails if any of the 4 metrics < 80%; `pnpm test:e2e` smoke green; none of the unit tests require a running database.
9. CI: `.github/workflows/ci.yml` (PR → install, lint, stylelint, typecheck, test with coverage report, build both apps); deploy-ready configs (`vercel.json` for web, `railway.json` + docs for api/Redis) prepared but NOT executed. Verify: config files exist and `pnpm build`/`pnpm test` commands referenced are runnable locally; the workflow launches on the next real PR.
10. Data/docs: `AGENTS.md` domain block (domain + contact email), `.env.example` full §12 with domain/email values, README rewrite (structure, scripts, MCP/`opencode.json` mapping), `opencode.json` without secrets, `mailpit` + Redis documented. Verify: `grep` for domain and email in `AGENTS.md` and `.env.example`; `git log` shows no secrets staged.

## Acceptance criteria

- [x] A clean clone runs `pnpm install && pnpm build` successfully with `pnpm-lock.yaml` as the only lockfile (`package-lock.json` absent).
- [x] The repo matches guidelines §2: `apps/web`, `apps/api`, `packages/shared`, `packages/tokens`, `packages/emails`, `docker-compose.yml`.
- [x] `pnpm dev` boots web and api concurrently (Turborepo) without manual steps on a fresh clone, excluding services.
- [x] `pnpm lint` (Biome) and `pnpm stylelint` (Stylelint over CSS + tokens) pass with zero errors.
- [x] `pnpm typecheck` passes across the workspace with `strict: true`.
- [x] `pnpm test` fails when any coverage metric is below 80% (statements, branches, functions, lines) and passes as committed.
- [x] `pnpm test:e2e` (Playwright) passes the smoke test locally.
- [x] No unit test requires a running Postgres, Redis or Mailpit to pass.
- [x] `docker compose up -d` exposes Redis and Mailpit; `apps/api` `/health` returns 200 and `/docs` renders OpenAPI.
- [x] `supabase start && pnpm db:migrate && pnpm db:seed` ends with every §6 table populated (count > 0).
- [x] `.env.example` includes every §12 variable, with `WEB_URL=https://jmmcdevsign.es`, `MAIL_FROM=hola@jmmcdevsign.es`, `ADMIN_EMAIL=hola@jmmcdevsign.es`.
- [x] `AGENTS.md` documents domain `jmmcdevsign.es` and email `hola@jmmcdevsign.es`; no secrets exist anywhere in the diff.
- [x] `packages/tokens` exports the 3 modes with `data-theme` convention and the missing `accent` token defined (`#FF5A1F`).
- [x] `packages/shared` exposes env schemas, shared API types and socket event names from §7.
- [x] `vercel.json` + `railway.json` configs exist in-repo and are unused until deployment day (no deploy runs in this spec).
- [x] CI workflow runs install/lint/stylelint/typecheck/test/build on every PR.
- [x] Radix UI primitives (headless) are installed as the interactive-behavior layer; no shadcn, no styled component library in dependencies.
- [x] README documents structure, available scripts, and how local DB/Redis/Mailpit start.

## Decisions

- **Yes:** converting the existing repo into `apps/web` (keeps history, including the design-system commit). Preserves prior work. **No:** fresh `create-next-app` scaffold from zero.
- **Yes:** Biome for JS/TS lint+format. Faster, single config, per guidelines §2. **No:** keeping ESLint + `eslint-config-next` alongside — duplicate config and slower gates; Stylelint stays only for CSS/token files (user's global rule).
- **Yes:** Radix UI headless primitives (Dialog, DropdownMenu, Popover, Tooltip) as accessible behavior layer, custom brutalist skin on top. **No:** shadcn/ui (its rounded/soft-shadow/pill aesthetic directly contradicts the DESIGN.md rules: 0px radius, shadows forbidden, hover by color inversion) and no other styled component library.
- **Yes:** full §6 schema v1 + seed now; changes later are incremental Drizzle migrations. **No:** `MOCK_MODE` in-memory data — two data paths to maintain; seed → DB → endpoints is one path.
- **Yes:** coverage ≥80% cumulative from the first commit, excluding mocks/config/types/generated code so the threshold is honest. **No:** deferring thresholds to the business-logic phase.
- **Yes:** CI on every PR + deployment configs committed but dormant; deployment is a manual, user-approved step later. **No:** executing a first deploy in this phase.
- **Yes:** Supabase CLI local Postgres + dockerized Redis/Mailpit locally. **No:** running Postgres in docker-compose (guidelines §2 fix Supabase CLI as the local Postgres path).
- **Yes:** pnpm as the only package manager, `packageManager` field pinned. **No:** Corepack sourcing (not bundled from Node ≥ 24.4); CI installs the pinned pnpm explicitly.
- **Yes:** OpenAPI autogenerated at `/docs` (Fastify plugin). **No:** hand-written API docs.
- **Yes:** spec lives at `specs/00-foundation.md`, in English (guidelines §0 docs rule), numbered 00 as the deliberate "epoch" the user established instead of skill default 01.
- **Yes:** domain `jmmcdevsign.es` + `hola@jmmcdevsign.es` to `AGENTS.md` + `.env.example` now. **No:** deferring the domain/email wiring to the Auth spec — both values are needed in `.env.example` from day one (`MAIL_FROM`, `ADMIN_EMAIL`).

## Risks

| Risk | Mitigation |
| --- | --- |
| pnpm version drift between local and CI | `packageManager` field pins the exact version; CI installs pnpm from that field. |
| Next 16 breaking changes vs known conventions | Before touching `apps/web` config, read the `node_modules/next/dist/docs/` guides (mandated by the `nextjs-agent-rules` block in `AGENTS.md`). |
| DB-dependent tests slipping into the unit suite | Coverage config keeps `test-unit` separate; CI runs unit tests without services (documented in README). Playwright smoke references a running `pnpm dev` and runs before PR merge locally. |
| Supabase MCP used to change schema → drift from Drizzle | All schema changes via Drizzle migrations; MCP explicitly read-only (docs + README rule). |
| Thresholds too aggressive over now-empty packages | Coverage config excludes scaffold/stub/mock files, config, types and generated code in `apps/*` and `packages/*`; thresholds measure only shipped code, so the numbers stay honest as real code arrives in SPEC 01+. |

## What is **not** in this spec

- The 9 screens' UI and their motion stack (GSAP/Lenis/ogl), including hero and pinned scroll sequences.
- Auth (Better Auth), approval flow, OAuth and the Admin Approval Email template.
- `next-intl` full wiring, loader, header/menu and base components.
- Real deployment (Vercel/Railway live, DNS for jmmcdevsign.es) or secrets provisioning.
- Storage uploads, Socket.IO traffic, AI SDK, Resend email sending.
- Any change to the DESIGN.md token values beyond adding the documented missing `accent` token.

Each one of those, if it lands, goes in its own spec.
