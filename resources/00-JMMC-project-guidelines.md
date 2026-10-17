# JMMC Portfolio — Project Guidelines (read before writing any code)

You are building the portfolio site of JMMC (Juanma), a fullstack developer and designer. The visual design lives in Stitch as 9 numbered screens (01 to 09). Your job is to implement it faithfully, in order, with the stack and rules below. Do not add libraries, pages or features that are not listed here without asking first.

## 0. Ground rules
- Language of code, comments, commits and docs: English. Language of the UI: Spanish by default with an ES/EN switch.
- TypeScript everywhere, `strict: true`, no `any` without a comment explaining why.
- Install the latest stable version of every dependency at setup time, then pin exact versions through the lockfile. Do not upgrade majors mid-project.
- Never commit secrets. All config through environment variables validated with Zod at startup.
- Mock data first, real backend after (see section 9, build order).

## 1. The 9 screens (fixed, never add or duplicate)
01 Landing · 02 Auth Modal · 03 Admin Approval Email · 04 Post Editor · 05 Demo Agent Builder · 06 Demo Leads Workflow · 07 Demo Lead Qualification · 08 Demo Orders Realtime · 09 Demo Business Backoffice.
Wizard steps, the open menu, themes, loading, empty and error states are states of these screens, not new routes.

Routes: `/` (01), `/demo/agents` (05), `/demo/leads-workflow` (06), `/demo/lead-qualification` (07), `/demo/orders` (08), `/demo/backoffice` (09), `/members/posts/new` and `/members/posts/[id]/edit` (04). The auth modal (02) is opened over any page with a query flag or a parallel route. The email (03) is a React Email template, not a route.

## 2. Monorepo and tooling
- **pnpm workspaces + Turborepo.**
- Node.js current LTS. pnpm via Corepack.
- Structure:
```
apps/
  web/            Next.js (App Router) — all screens and UI
  api/            Node.js API + WebSockets
packages/
  shared/         Zod schemas, TS types, event names, constants
  tokens/         design tokens (CSS variables) shared by web and email
  emails/         React Email templates (03 Admin Approval Email)
docker-compose.yml   redis and mailpit for local dev (Postgres runs through the Supabase CLI: `supabase start`)
```
- Lint and format: **Biome**. Git hooks: **lefthook** (lint + typecheck on commit). Commits: Conventional Commits.
- Tests: **Vitest** (unit), **Playwright** (e2e: auth flow, approval flow, orders realtime sync).
- Scripts at the root: `dev`, `build`, `lint`, `typecheck`, `test`, `db:migrate`, `db:seed`.

## 3. Frontend (`apps/web`)
- **Next.js (App Router) + React + TypeScript.** Server Components by default; client components only for interactive pieces (animations, forms, sockets).
- **Tailwind CSS v4** wired to the design tokens (CSS variables). No component library; every component is custom and matches the Stitch design (flat, sharp corners, hairline borders, curly-brace motif, four-point star accent).
- **GSAP + ScrollTrigger + @gsap/react** for all scroll and timeline animation (hero sequence, pinned sections, sticky blur stack, timeline, progress bars and donuts, counters). Do not mix in a second animation library.
- **Lenis** for smooth scrolling, synced with ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` and the GSAP ticker).
- **ogl** for the WebGL starfield of the hero (lighter than three.js). Lazy-load it, pause when off-screen, fewer stars on mobile, static fallback with reduced motion.
- **React Flow (@xyflow/react)** for the n8n-style canvas (06), with custom flat nodes and edges.
- **dnd-kit** for the Kanban drag and drop (08).
- **Tiptap** for the rich text editor (04), JSON output stored in the database.
- **Recharts** for charts, restyled to uniform flat strokes (08, 09).
- **TanStack Query** for server state. **React Hook Form + Zod** for forms and validation (schemas imported from `packages/shared`).
- **socket.io-client** for realtime (08, 06, 07).
- **next-intl** for i18n (ES/EN). All strings in `messages/es.json` and `messages/en.json`. No hardcoded copy in components.
- **Icons:** `lucide-react` with a fixed uniform stroke width for UI icons; brand icons for Apple, Google and GitHub from `simple-icons`, rendered monochrome.
- **Fonts:** self-hosted through `next/font`. Use the display, text and mono families defined in the Stitch design system; if none is defined, default to Big Shoulders Display (display, uppercase), Instrument Sans (text), JetBrains Mono (mono).

## 4. Backend (`apps/api`)
- **Node.js + Fastify + TypeScript.** Validation with Zod (shared schemas). OpenAPI docs generated and served at `/docs`.
- **PostgreSQL hosted on Supabase** (one dev project, one prod project; locally via the Supabase CLI) with **Drizzle ORM**, versioned migrations and a seed script that loads realistic mock data. **Schema changes happen only through Drizzle migrations committed to the repo.** The Supabase MCP is for reading, debugging, logs and advisors, never for changing the schema, so the database never drifts from the code.
- **Supabase Storage** for post cover images and uploads.
- **Socket.IO** on the same server for realtime events.
- **Redis + BullMQ** for background jobs (lead follow-up sequences, email sending, scheduled reminders).
- **Auth: Better Auth** with email/password plus Google, Apple and GitHub OAuth. Sessions in secure httpOnly cookies. Roles: `admin`, `member`. User status: `pending`, `approved`, `rejected`. Nobody gets into the members area until approved.
- **Email:** Resend in production, **Mailpit** locally. Templates with **React Email** in `packages/emails`.
- **AI:** Vercel AI SDK (`ai`) so the provider is swappable by env var (`AI_PROVIDER`, `AI_MODEL`). Used by demos 05 and 07. Always keep a deterministic mock fallback when no key is set.
- Security: `@fastify/helmet`, `@fastify/rate-limit` (stricter on auth and contact), CORS limited to the web origin, CSRF protection on cookie-authenticated mutations, input sanitation for rich text, audit log for sensitive actions.

## 5. Admin approval flow (screens 02 and 03)
1. A person registers (email/password or Apple, Google, GitHub). The user is created with `status = pending`.
2. The API creates an `approval_request` with a 6-digit code (store only its hash, expires in 15 minutes) and a signed, single-use token (HMAC, expires in 24 hours).
3. An email built from the "Admin Approval Email" template is sent to the admin address (`ADMIN_EMAIL`) with applicant data, the code and two buttons: Approve and Reject, each a signed single-use link to `GET /api/approvals/:token?decision=approve|reject`.
4. The endpoint validates token and code rules, records the decision, updates the user status and redirects to the web app showing the admin result state inside the auth modal.
5. The applicant sees "Pendiente de aprobación" whenever they log in until the decision is made. Notify them by email when approved or rejected (simple template, same style).

## 6. Data model (summary)
- `users`, `accounts` (OAuth), `sessions`, `approval_requests`.
- `posts` (title, slug, excerpt, content_json, cover_url, category, tags, status draft/published, published_at, author_id).
- `contact_messages`.
- `agents` (config JSON: name, tone, tools, knowledge) and `agent_messages` for demo 05.
- `leads` (name, email, company, source, message, score 0–100, status hot/warm/cold, reasoning JSON), `followup_steps` (lead_id, channel, scheduled_at, status) for 06 and 07.
- `orders`, `order_items`, `order_events` for demo 08.
- `shops`, `customers`, `products` (stock, min_stock), `invoices`, `audit_log` for demo 09, with role-based permissions enforced in the API and reflected in the UI.

## 7. API and realtime contract (keep in `packages/shared`)
- REST: `/auth/*` (handled by Better Auth), `/approvals/:token`, `/posts` (public list, member CRUD), `/contact`, `/leads`, `/agents`, `/orders`, `/backoffice/*`.
- Socket events (namespaced): `order:new`, `order:update`, `order:ready`, `lead:new`, `lead:scored`, `followup:done`, `presence:ping`. Every event carries a timestamp so the UI can show latency in milliseconds (demo 08).
- Demo data endpoints are public but rate-limited and reset periodically (cron) so the demos stay clean.

## 8. Design system rules (from the logo)
- Tokens live in `packages/tokens` as CSS variables, three modes: Oscuro (default), Claro, Sistema. Applied with `data-theme="dark|light|system"` on `<html>`; an inline script sets it before first paint to avoid flashes; the choice is persisted in `localStorage`.
- Dark: bg `#0C0C0E`, surface `#131316`, text `#EFEBE3`, muted `#8A867D`, line `#26262B`, accent `#FF5A1F`. Light: bg `#EFEBE3`, surface `#E6E1D7`, text `#0C0C0E`, muted `#6B675F`, line `#D3CEC3`, accent `#FF5A1F` (`#B8350A` when the accent is used as text).
- Motif: curly braces `{ }` frame titles, labels and active states (SVG, not text characters); the four-point star is the only accent shape (bullet, timeline node, loader, cursor, live indicator). Sharp corners, hairline borders, uniform strokes with flat terminals, no soft shadows, no gradients except the starfield and film grain on images.
- Logo and loader are SVG assets in `apps/web/public/` (`logo-on-dark.svg`, `logo-on-light.svg`, loader files, favicon set). Swap by theme with the `theme-dark-only` / `theme-light-only` classes.
- Header: fixed, transparent at the top, backdrop blur (about 14px) once scrolled. It is the only blurred surface. Mount the full-screen menu **outside** the header element so `position: fixed` is not trapped by `backdrop-filter`.
- Scroll depth effect (demo cards and blog slider): pinned sections; passed items scale to about 92%, fade to about 40% and blur progressively (max 12px, lighter on mobile), limited to the 2–3 visible items for performance.
- Accessibility: WCAG AA contrast, visible focus (brace outline), 44px touch targets, `prefers-reduced-motion` disables pinned sequences, blur and WebGL, keyboard-accessible menu, modal and slider with proper ARIA.

## 9. Loader rule
- Single source of truth: `withLoader(promise, minMs = 500)` in `apps/web/lib/loading.ts` plus a `<GlobalLoader />` mounted once at the root.
- Every call to the backend goes through the `api()` wrapper, never raw `fetch`. The loader shows for at least 500 ms on: first page entry (preloader that exits into the hero sequence), member area and session loading, and every backend call. Buttons that submit show the inline 20px loader.
- Lists and cards use skeletons, not the loader.

## 10. Build order (follows the screen numbers)
0. **Foundation:** monorepo, tokens, theme switcher, i18n, loader, header, full-screen menu, base components.
1. **01 Landing:** hero (pinned sequence + starfield), presentación, demos stack with blur, skills (bars and donuts), timeline, blog slider, contact form, footer. Static mock data.
2. **02 Auth Modal + 03 Email:** auth, approval flow, React Email template, Mailpit locally.
3. **04 Post Editor:** Tiptap, drafts, publish, blog slider reading from the database.
4. **05 Agent Builder.**
5. **06 Leads Workflow** (React Flow canvas, live log).
6. **07 Lead Qualification** (scoring, reasoning, follow-up sequences with BullMQ).
7. **08 Orders Realtime** (client and kitchen panels synchronized through Socket.IO, event log with latency).
8. **09 Business Backoffice** (RBAC, audit log, role switcher).
9. **Hardening:** e2e tests, performance budgets, SEO and Open Graph, a11y pass, deploy.

## 11. Definition of done (per screen)
- Matches the Stitch design on Desktop (1440) and Mobile (375) and is responsive in between.
- Works in Oscuro, Claro and Sistema, and in ES and EN, with no hardcoded strings.
- Loader, skeleton, empty and error states implemented.
- Keyboard and screen-reader pass, reduced-motion fallback tested.
- No layout shift, Lighthouse performance 90+ on mobile for 01 Landing (lazy-load WebGL and heavy sections).
- Unit or e2e test for the critical path of that screen.

## 12. Environment variables (`.env.example`)
`DATABASE_URL`, `REDIS_URL`, `WEB_URL`, `API_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`, `ADMIN_EMAIL`, `APPROVAL_TOKEN_SECRET`, `AI_PROVIDER`, `AI_MODEL`, `AI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only, never exposed to the browser), `SUPABASE_STORAGE_BUCKET`.

Variables used only by the coding agent (OpenCode), never by the app: `STITCH_API_KEY`, `GITHUB_PAT`. Keep them in your shell or a git-ignored file.

## 13. Deployment
- `apps/web` on Vercel. `apps/api` and Redis on Railway (long-lived connections are required for WebSockets and workers, which cannot run on serverless functions). PostgreSQL and Storage on Supabase.
- CI with GitHub Actions: install, lint, typecheck, test, build on every pull request.

## 14. MCP servers for the coding agent (OpenCode)
Goal: the coding agent works on real tools instead of guessing. The config lives in `opencode.json` at the repo root (see the provided file). MCP tools consume model context, so keep only the servers needed for the current phase enabled; the others stay `"enabled": false`.

| MCP | Use | Phase |
|---|---|---|
| **Stitch** (`https://stitch.googleapis.com/mcp`, API key) | Read the 9 screens directly from the Stitch project and build them in order | all |
| **Supabase** (`https://mcp.supabase.com/mcp`, OAuth) | Inspect tables, run read queries, logs, advisors, docs | 2 onward |
| **GitHub** (`https://api.githubcopilot.com/mcp/`, token) | Issues, branches, pull requests, CI status | all |
| **Context7** (`https://mcp.context7.com/mcp`) | Up-to-date docs for Next.js, GSAP, React Flow, Better Auth, Drizzle and the rest | all |
| **Playwright** (local, `@playwright/mcp`) | Open the running app, check responsive layouts, themes and flows | testing |
| **Vercel** (`https://mcp.vercel.com`, OAuth) | Deployments, build logs, env vars of `apps/web` | deploy |
| **Railway** (local, `@railway/mcp-server`, needs the Railway CLI logged in) | Deploy and inspect `apps/api` and Redis, logs, variables | deploy |

Optional: Resend and Redis also publish MCP servers; add them only if you need them, and check their docs for the exact command.

Safety rules for MCP:
- Supabase: always scope the URL to the **dev** project with `project_ref`. Never connect the agent to the production project. If a production inspection is ever needed, use `read_only=true`.
- Never put tokens in `opencode.json`; reference environment variables (`{env:NAME}`).
- Schema changes only through Drizzle migrations (section 4). Destructive actions (dropping tables, deleting deployments or projects) always require explicit confirmation from the human.
- Commit `opencode.json` without secrets; document in the README which variables each MCP needs.
