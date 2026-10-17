<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Specs (build in this order; each spec maps to one Stitch screen)

Each spec below is a summary of the Stitch prompt for that screen. The Stitch project is the visual source of truth (read it through the Stitch MCP); this text explains the intent, behavior and states behind each screen. Every spec follows the global rules of Spec 00. Never add, split or duplicate screens: steps, themes, menu, loading, empty and error states are states of these specs, not new routes.

### Spec 00 — Global design system and foundation
The whole site derives its look from the logo: the monogram JM in bold flat-cut strokes, framed by curly braces `{ }` and accented by a small orange four-point star. Braces frame titles, labels, numbers, chips and active states; the star is the only accent shape (bullet, timeline node, loader, cursor, live indicator). Sharp corners, hairline borders, uniform strokes, no soft shadows, no gradients except the starfield and grain on images. Tall condensed display type for headlines, neutral sans for text, mono for details written in braces, like `{ 01 / 09 }`. It must not look AI-generated: asymmetric editorial layouts, oversized cropped type, direct first-person copy.
- **Themes:** Oscuro (default), Claro and Sistema, through CSS tokens and `data-theme` on `<html>`. Orange as text uses the darker variant in Claro.
- **Language:** Spanish by default with an ES/EN switch that translates the whole UI (no hardcoded strings). The switch lives in the header on Desktop and inside the menu on Mobile; the theme switcher too (header on Desktop, menu on Mobile).
- **Header:** fixed, transparent at the top, backdrop blur (about 14px) once scrolled; the only blurred surface. Logo, theme and language switches, "Acceder" (opens Spec 02) and "Menú".
- **Menu:** full-screen overlay on Desktop and Mobile with a curtain reveal, huge numbered links (Presentación, Demos, Skills, Trayectoria, Blog, Contacto), social links. Mounted outside the header element.
- **Motion:** smooth scroll (Lenis) with GSAP ScrollTrigger; text reveals, parallax, sticky transforms, counters, scroll progress bar, star-shaped cursor on Desktop. Scroll depth effect on pinned sections: the element in focus is sharp, passed ones scale down, fade and blur progressively. Everything has a reduced-motion fallback.
- **Loader:** the logo loader (braces opening and closing around a rotating star) is the only loading indicator: first-visit preloader that exits into the hero, member area and session loading, every backend call (minimum 500 ms through `withLoader` and the `api()` wrapper) and a 20px inline version inside submitting buttons. Lists and cards use skeletons.
- **Responsive:** every screen is designed once for Desktop (1440) and once for Mobile (375) and works in between.

### Spec 01 — Landing (`/`)
One scrolling page, in this order:
1. **Hero:** 100vh at rest, pinned for about 300vh of scroll so scrolling drives a cinematic sequence. Intro on load: one orange star pulses, bursts into a starfield, the braces draw themselves and constellation lines form JMMC. On scroll: stars stretch into warp streaks toward a huge orange star, braces open outward, the name grows and its letters move at different speeds, and finally the star scales up and reveals the next section through a star-shaped clip-path. WebGL starfield with ogl, lazy-loaded; fewer stars on mobile; static fallback with reduced motion.
2. **Presentación:** first-person bio, portrait in a brace frame, three animated stats.
3. **Demos:** five large cards that link to Specs 05 to 09. The section is pinned: each card stays sticky and the next slides over it; passed cards shrink, fade and blur.
4. **Skills:** animated progress bars and donuts grouped by area (Frontend, Backend, IA y automatización, Diseño) with count-up and fill on scroll.
5. **Trayectoria:** vertical timeline whose hairline draws itself on scroll, star nodes that turn orange when reached, entries sliding in alternately.
6. **Blog:** a slider fed from the database, pinned so scroll moves it; the post in focus is sharp and passed ones blur and shrink. Arrows, drag and swipe, progress indicator, skeleton and empty states. Posts do not open any new page. A small "Acceso miembros" link opens Spec 02.
7. **Contacto:** form (nombre, email, mensaje) with validation, success state and rate limiting on the API; social links and a closing headline.
8. **Footer.**

### Spec 02 — Auth Modal (dialog over the landing)
A single dialog (bottom sheet on Mobile) framed by braces, with a step indicator made of stars. Step 1: switch between Acceder and Crear cuenta, three identical buttons (Apple, Google, GitHub) and email plus password; registration also asks for name, with a 4-star strength meter and a terms checkbox. Step 2, after any registration (email or social): "Pendiente de aprobación". A pending user who logs in sees the same state. Other states: rejected, admin result ("Acceso aprobado/rechazado para [nombre]", reached from the email buttons), inline errors, "correo ya registrado", button and social loading.
**Behavior:** nobody enters the members area until approved. Every new account creates an approval request (see guidelines section 5).

### Spec 03 — Admin Approval Email (React Email template, not a route)
A transactional email sent to the admin address when someone registers. 600px single column, flat blocks, web-safe fallback fonts, light layout plus dark-mode adaptation. It shows the braces logo, the headline "Nueva solicitud de acceso", an applicant table (name, email, sign-up method, date and time, approximate city, device), a six-digit confirmation code in a braced box valid for 15 minutes, and two buttons: Aprobar acceso (solid orange) and Rechazar (outline). Each button is a signed single-use link to the API. A security note and footer close it. A simple approved/rejected notification email for the applicant follows the same style.

### Spec 04 — Post Editor (`/members/posts/new`, `/members/posts/[id]/edit`)
For approved members only; the same screen creates and edits. Top bar with Volver, avatar, status chip (Borrador / Publicado), Guardar borrador, Publicar and an autosave indicator. Large title field, cover upload (Supabase Storage), Tiptap rich text editor with a floating toolbar, and a side panel (category, tags, excerpt, date) that becomes a bottom sheet on Mobile. Published posts feed the landing slider. States: publishing (loader), saved, validation errors, empty.

### Spec 05 — Demo Agent Builder (`/demo/agents`)
Shows how to create an AI agent. Left: configuration (name, tone, tool toggles, knowledge sources, prompt). Right: live preview chat with typing indicator and loading. Mobile uses two tabs, Configurar and Probar. Uses the AI SDK with a swappable provider and a deterministic mock fallback when no key is set. Volver to the landing.

### Spec 06 — Demo Leads Workflow (`/demo/leads-workflow`)
An n8n-style canvas built with React Flow: dotted grid, flat nodes (Webhook, AI Agent, CRM, Email, Slack) joined by right-angled cables with star-shaped pulses traveling along them, plus a side panel with a live log of incoming leads (name, source, status chip). A `{ en vivo }` indicator. Mobile shows a simplified vertical flow with the log as a bottom sheet. Events arrive over Socket.IO.

### Spec 07 — Demo Lead Qualification (`/demo/lead-qualification`)
The result of an AI agent that receives, qualifies and follows up leads. Three columns: inbox (score 0–100 bar with a star, status chips Caliente/Templado/Frío, live arrivals, filters), lead detail (message, the agent's reasoning for the score, suggested next action, approve or reassign) and follow-up timeline (email, WhatsApp, reminder, call; stars turn orange when done; pause toggle). Four animated KPIs on top. Follow-up steps run as BullMQ jobs; scoring and step completion are pushed through sockets. Mobile uses three tabs.

### Spec 08 — Demo Orders Realtime (`/demo/orders`)
A WebSocket practice for a burger restaurant: two synchronized panels, client (menu, quantities, total, "Pedir") and kitchen (Kanban Nuevo / Preparando / Listo with drag and drop and timers). An order placed on the client side appears instantly in the kitchen, and a status change updates the client view without reloading. A connector between panels shows messages traveling; a bottom `{ eventos }` log lists socket events (`order:new`, `order:update`, `order:ready`) with latency in ms. Connection indicator with reconnecting and offline states, KPIs and a small sales chart. Mobile: segmented Cliente / Cocina and a collapsible log.

### Spec 09 — Demo Business Backoffice (`/demo/backoffice`)
A back-office SaaS for a small online shop, all inside one screen. Sidebar (Resumen, Pedidos, Clientes, Facturas, Inventario, Equipo, Informes), top bar with search, date range, a role switcher (Admin, Editor, Lector) and the live indicator. Overview with four KPIs, sales chart (this month vs previous), latest orders table, pending invoices, low-stock bars and an activity feed that works as an audit log. A right drawer shows customer detail with "Emitir factura" and "Editar", which are disabled with a lock in the Lector role. **Permissions are enforced in the API and reflected in the UI**; this is the point of the demo. States: skeletons, empty, permission denied, toast.

### Cross-spec acceptance
Each spec is done when it matches Stitch on Desktop and Mobile, works in all three themes and both languages, has loader, skeleton, empty and error states, passes a keyboard and screen-reader check, has a reduced-motion fallback, and has a test for its critical path.

## Referencias
resources/

## Reglas básicas
- Responder siempre en español.
- Una vez te de permiso para seguir con la siguiente fase harás commit descriptivo de los cambios realizados en la fase anterior.
- Una vez revisadas los archivos temp y las capturas de playwright se borraran y nunca se comitearán al igual que los archivos de la carpeta /.playwright-mcp.
- Al terminar las prubas con playwright debes bajar siempre el servidor o utilizar otro puerto que esté libre
- Los test deben estar al >80% en las cutaro métricas
- Stylint debe pasar
- Typecheck
- Sonarqube (local de momento)
- Lint

## Reglas de código
- Usar código limpio, nombres, funciones, variables, etc en inglés.
- Si un mock (o cualquier código) deja de utilizarse, se borra; no se dejan archivos ni imports muertos.
- Los links serán componente Link de next.js, con cursor pointer
- las rutas seran con [slug] para SEO en rrss.

## Agentes
- `spec-verifier` (definido en `.opencode/agents/spec-verifier.md`, versionado en el repo): agente verificador de los "Acceptance criteria" de un spec.
- Localiza el spec (`specs/`, `docs/`, `*.spec.md`…), revisa cada criterio, verifica en el código y en UI (Playwright) y en la doc actual (Context7) si se cumple.
- Corrige lo que haga falta y solo marca `- [x]` los criterios realmente verificados; los no verificados quedan en `- [ ]` con el motivo.
- Termina con un resumen: cumplidos, pendientes y correcciones realizadas.
- Responde en español y usa nombres en inglés en el código.