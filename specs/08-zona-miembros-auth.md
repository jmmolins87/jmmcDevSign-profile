# SPEC 08 — Zona de miembros: split-screen editorial + auth mock

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 05
> **Date:** 2026-09-26
> **Objective:** Implementar la pantalla 05 (`references/05_zona_de_miembros/`) como ruta `/zona-miembros` con layout split-screen 50/50 (desktop) / apilado (mobile): panel izquierdo cinematográfico editorial y panel derecho formulario de autenticación completo con control segmentado Entrar/Crear cuenta, validación inline visual, enlace mágico y footnote de seguridad — todo en modo mock `[placeholder]` sin backend real, respetando el tema global Paper/Night y animaciones Anime.js.

## Por qué existe esta spec

La referencia `references/05_zona_de_miembros/code.html` + `screen.png` define una pantalla de acceso editorial split-screen que no existe en el sitio. El `MenuOverlay` (SPEC 05) ya expone la tarjeta "Zona de miembros" con botón `Entrar` inerte (`aria-disabled="true"`). Hace falta convertir esa referencia en una ruta real de Next.js App Router, fiel al diseño, integrada con el sistema de tema (SPEC 05) y animaciones (SPEC 01), pero **sin backend real** — el auth queda como mock visual `[placeholder]` igual que el formulario de contacto de SPEC 01. Una spec futura cableará Supabase Auth real.

## Alcance

**In:**

- Ruta `/zona-miembros` (App Router, `app/zona-miembros/page.tsx`) con metadata editorial.
- Layout split-screen: `<main class="flex flex-col lg:flex-row min-h-[760px] rounded-[14px] overflow-hidden">` — izquierda `lg:w-1/2` (panel cinematográfico), derecha `lg:w-1/2` (formulario). Mobile: apilado, izquierda `min-h-[480px]`.
- **Panel izquierdo (editorial):** imagen de fondo `bg-cover bg-center` con `data-alt` descriptivo, viñeta `bg-gradient-to-t` + `bg-radial`, badge `05 / ACCESO EDITORIAL` con punto acento, cita editorial *«Escribir también es diseñar.»* en `font-headline-lg italic`, tarjeta autor (JUANMA JMMC + tagline + `verified_user` TLS 1.3), todo con `data-anim="fade-up"`.
- **Panel derecho (auth canvas):** header `ZONA PRIVADA — PORTAFOLIO v2.6.4`, `h1 "Entrar"`, copy descriptivo.
- **Control segmentado** (píldoras `rounded-full`): `Entrar` (activo) / `Crear cuenta` — alterna estado UI, mismo formulario (email + password), solo cambia el `type="submit"` action label y copy secundario.
- **Formulario** con validación nativa HTML5 + estados visuales:
  - Email: `type="email"`, label `CORREO ELECTRÓNICO`, hint `ID DE AUTOR`, icono `alternate_email`, placeholder `nombre@estudio.io`.
  - Password: `type="password"`, label `CONTRASEÑA`, link `¿Olvidé mi contraseña?` (inertes), toggle visibilidad (`visibility`/`visibility_off`), icono `lock` en error callout.
  - **Error callout arquitectónico** (inline, `mt-2 p-3.5 rounded-xl bg-error-container`): icono `error`, mensaje `La contraseña introducida no coincide con los registros autorizados.`, código `ERR_AUTH_INVALID_TOKEN`, badge `Intento 1/3` — **estado visual `[placeholder]`**, se muestra/oculta con animación `scale-[1.02]` al submit fallido (mock).
  - Checkbox `Recordar este terminal` + mono `Sesión: 30 días`.
  - Botón primario `Acceder a la zona de miembros` (`w-full h-12 rounded-xl bg-primary`) con icono `file_download` y micro-animación `group-hover:translate-x-1`.
  - Botón secundario `Enviarme un enlace mágico` con icono `auto_fix_high` (rotación hover) y toast visual `¡Enlace enviado a tu buzón!` (mock, 3.5s).
- **Security footnote card**: `info` icon + copy editorial + línea `Autenticación Cifrada` (punto teal) + link `Solicitar Invitación →` (inertes).
- **Bottom meta**: `ZONA_EDITORIAL // ID: JMMC-SYS-89` / `ESTADO: SERVIDOR ACTIVO` (mono 11px).
- **Animaciones Anime.js v4** sobre hooks `data-anim` declarativos: `fade-up` (paneles), `stagger-label` (campos formulario, 45ms), `clip-reveal` (imagen panel izquierdo, opcional), respetando `prefers-reduced-motion: reduce` (sin timelines).
- **Tema**: hereda `data-theme` global (Paper/Night) — **NO se fuerza a Paper** (no es demo operativa como `/demos/*`); es pantalla editorial del sitio principal.
- **Accesibilidad**: labels asociados, `aria-invalid` en error, foco visible (`focus:ring-2 focus:ring-primary` / `focus:ring-error`), `role="alert"` en error callout, Tab order lógico.
- **Datos**: contenido hardcodeado en el componente (no en `lib/content.ts` — es pantalla única, no reutilizable), todo marcado `[placeholder]` en comentarios.
- **Verificación**: capturas Playwright a 1440px y 390px en `.playwright-mcp/08-zona-miembros-auth/after/` vs `references/05_zona_de_miembros/screen.png`; `npm run lint` + `npx tsc --noEmit`.

**Fuera de alcance (specs futuras):**

- Supabase Auth real (email/password, magic link OTP, recuperación, confirmación email, RLS, sesión server-side).
- Registro real con campos extra (nombre, confirmar password, términos).
- i18n (EN inerte).
- Dashboard post-login, zona privada real, avatar/foto, logout.
- Persistencia de sesión real (JWT, refresh tokens, `persistSession`).
- Rate-limiting, `ERR_AUTH_INVALID_TOKEN` real, contador de intentos persistente.
- Imagen del panel izquierdo localizada en `public/` (hotlink se mantiene por decisión de SPEC 01).
- Animación de entrada del panel izquierdo tipo `parallax`/`clip-reveal` compleja — `fade-up` basta.

## Modelo de datos

No hay nuevas estructuras persistentes. El estado es efémero (React `useState`):

```ts
// app/zona-miembros/AuthForm.tsx (estado local)
type AuthMode = "login" | "register";
type FormState = {
  email: string;
  password: string;
  remember: boolean;
  showPassword: boolean;
  errorVisible: boolean;
  attempt: number;        // 1..3 (mock)
  magicLinkSent: boolean;
  isSubmitting: boolean;
};
```

Convención: todo dato de ejemplo lleva `// [placeholder]` en el componente. No se añade nada a `lib/content.ts` ni `lib/data/`.

## Plan de implementación

1. **Ruta y página contenedora.** Crear `app/zona-miembros/page.tsx` (Server Component) con metadata (`title: "Zona de miembros · JMMC"`, `description: "Acceso editorial para autores y colaboradores"`), importar `ZonaMiembrosClient` (Client Component) y renderizarla. *Verificar:* `npm run build` pasa; `/zona-miembros` responde 200.
2. **Componente principal split-screen.** Crear `app/zona-miembros/ZonaMiembrosClient.tsx` (`"use client"`): layout `flex flex-col lg:flex-row min-h-[760px] rounded-[14px] overflow-hidden`, dos mitades. Panel izquierdo: `EditorialPanel`; panel derecho: `AuthPanel`. *Verificar:* a 1440px dos columnas 50/50; a 390px apilado, izquierda `min-h-[480px]`.
3. **Panel editorial (`EditorialPanel`).** Imagen de fondo (hotlink de la referencia), viñetas, badge `05 / ACCESO EDITORIAL`, cita, tarjeta autor, meta `REGISTRO PRIVADO`. `data-anim="fade-up"` en bloques. *Verificar:* jerarquía tipográfica coincide con `screen.png`; `font-headline-lg italic` en la cita; mono 11px en meta.
4. **Panel auth (`AuthPanel`).** Header stack, control segmentado (`Entrar`/`Crear cuenta`), formulario `AuthForm`, footnote, bottom meta. *Verificar:* control segmentado alterna clase activa (`bg-inverse-surface text-inverse-on-surface shadow-sm` vs `text-on-surface-variant`); `h1` cambia "Entrar" / "Crear cuenta"; copy descriptivo cambia acorde.
5. **Formulario (`AuthForm`).** Campos email/password con iconos, toggle password, checkbox, botones, error callout (oculto por defecto), magic link toast. Validación nativa (`required`, `type="email"`). Submit mock: `preventDefault`, `isSubmitting=true`, 700ms, muestra error callout con `scale-[1.02]`, restaura. Magic link: toast 3.5s. *Verificar:* focus rings (primary/error), `aria-invalid` en password al error, `role="alert"` en callout.
6. **Animaciones Anime.js.** `useLayoutEffect` en `ZonaMiembrosClient`: `fade-up` en paneles (24px, 700ms, outExpo), `stagger-label` en campos del formulario (8px, 600ms, delay 45ms). Panel izquierdo: `clip-reveal` opcional en imagen (CSS `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)`, 1000ms, outExpo). Todo anulado si `prefers-reduced-motion: reduce`. *Verificar:* con `reduce` no hay timelines; sin `reduce`, entrada escalonada visible.
7. **Integración menú overlay.** En `MenuOverlay.tsx`, cambiar el botón "Zona de miembros" de `aria-disabled="true"` a `<a href="/zona-miembros" onClick={onClose}>` (navega y cierra overlay). *Verificar:* click en "Entrar" del overlay → cierra overlay → navega a `/zona-miembros`.
8. **QA visual.** Capturar 1440px y 390px: página completa, formulario con error callout visible, magic link toast, modo Night (cambiar tema y recargar). Comparar con `references/05_zona_de_miembros/screen.png`. Ejecutar `npm run lint` y `npx tsc --noEmit`. *Verificar:* cero desviaciones de jerarquía, ritmo, alineación, color; cero errores.

## Criterios de aceptación

- [x] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [x] `/zona-miembros` renderiza el split-screen 50/50 a 1440px y apilado a 390px (izquierda `min-h-[480px]`).
- [x] Panel izquierdo: imagen `bg-cover`, viñetas, badge `05 / ACCESO EDITORIAL`, cita *«Escribir también es diseñar.»* en `font-headline-lg italic`, tarjeta autor JUANMA JMMC + `verified_user` TLS 1.3.
- [x] Panel derecho: header `ZONA PRIVADA — PORTAFOLIO v2.6.4`, control segmentado `Entrar`/`Crear cuenta` funcional (cambia `h1` y copy), formulario email/password con iconos, toggle password, checkbox, botón primario, botón magic link, footnote, bottom meta.
- [x] Error callout arquitectónico: oculto por defecto; al submit mock (700ms) aparece con animación `scale-[1.02]`, muestra `ERR_AUTH_INVALID_TOKEN` + `Intento 1/3`, `role="alert"`, `aria-invalid` en password.
- [x] Magic link: click → toast `¡Enlace enviado a tu buzón!` 3.5s con icono `mark_email_read` bounce.
- [x] Control segmentado: `Entrar` activo por defecto (bg acento + shadow); `Crear cuenta` alterna UI (mismo formulario, `h1` "Crear cuenta", copy "Registra tu acceso al gestor editorial...").
- [x] Animaciones: `fade-up` paneles, `stagger-label` 45ms en campos, `clip-reveal` opcional en imagen izquierda; **nada** con `prefers-reduced-motion: reduce`.
- [x] Tema: hereda `data-theme` global; en Night, background `#0F0E0D`, surface `#181614`, ink `#F3EEE5`, acento `#FF6A45`, teal `#5CC8BE`; en Paper, valores SPEC 01. **Sin forzar `light`**.
- [x] Menú overlay: botón "Entrar" en tarjeta "Zona de miembros" navega a `/zona-miembros` y cierra overlay.
- [x] Accesibilidad: labels `for`/`id`, focus rings visibles, `aria-invalid`, `role="alert"`, Tab order lógico, `ESC` no rompe (no hay overlay aquí).
- [x] Capturas Playwright 1440px/390px en `.playwright-mcp/08-zona-miembros-auth/after/` sin desviaciones vs `screen.png` (Paper) y vs Night equivalente.
- [x] Todo dato de ejemplo marcado `[placeholder]` en comentarios del componente.

## Decisiones

- **Sí:** ruta `/zona-miembros` (español, coincide con label del overlay). **No:** `/auth`, `/login`, `/members` — el proyecto es Spanish-first y el overlay dice "Zona de miembros".
- **Sí:** mock visual `[placeholder]` (igual que formulario contacto SPEC 01). **No:** Supabase Auth real — SPEC 03 solo cubre blog/imágenes; auth real merece su spec (migración, RLS, email templates, rate-limit, dashboard post-login).
- **Sí:** mismo formulario para Entrar/Crear cuenta (solo cambia copy y action label). **No:** campos extra en registro — la referencia no los tiene; spec futura los añadirá si Supabase lo requiere.
- **Sí:** error callout y magic link como estados visuales mock (animaciones de 700ms/3.5s). **No:** validación real, contador de intentos persistente, envío email real.
- **Sí:** persistencia mock en `localStorage["auth:v1"]` solo para "Recordar este terminal" (guarda `{ email, remember, expiresAt }`); no hay sesión real. **No:** JWT, cookies, `persistSession`.
- **Sí:** tema global heredado (Paper/Night). **No:** forzar Paper como `/demos/*` — esta pantalla es editorial, no "modo Operate"; el usuario espera coherencia con el resto del sitio.
- **Sí:** animaciones `fade-up` + `stagger-label` 45ms + `clip-reveal` opcional en imagen. **No:** `parallax` ni `draw-line` — la referencia solo declara `fade-up` en bloques; `clip-reveal` añade craft sin desviarse.
- **Sí:** hotlink de imagen mantenido (decisión SPEC 01 asumida). **No:** descargar a `public/` ahora.
- **Sí:** `MenuOverlay` botón "Entrar" → `<a href="/zona-miembros" onClick={onClose}>` (navega + cierra). **No:** abrir modal/auth inline — la referencia es pantalla completa.
- **Sí:** `v2.6.4` hardcodeado en header auth (como en referencia). **No:** version dinámica — es dato editorial `[placeholder]`.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Hotlink de imagen caduca | Decisión heredada de SPEC 01; spec futura de assets la localiza |
| Anime.js `clip-reveal` en imagen choca con `bg-cover` + viñetas | Probar en isolation; si falla, caer a `fade-up` simple en el contenedor izquierdo |
| Focus management en error callout (screen readers) | `role="alert"` + `aria-live="assertive"` en callout; foco NO se mueve al callout (patrón inline error) |
| Tema Night: contraste del error callout (`bg-error-container` / `text-on-error-container`) | Verificar con `getComputedStyle` en Night: `error` `#FF6A45`, `error-container` derivado; ajustar tokens si falla AA |
| `stagger-label` en campos: el control segmentado tiene dos botones, no labels | Aplicar `stagger-label` solo al contenedor del formulario (campos + checkbox + botones), no al segmentado |
| Mobile: panel izquierdo `min-h-[480px]` puede ser alto en viewports pequeños | `min-h-[480px] lg:min-h-[760px]` ya en referencia; en 390px viewport ~660px, deja espacio para formulario |

## Lo que **no** está en esta spec

- Supabase Auth, sesión real, dashboard post-login, logout, avatar.
- i18n, registro con campos extra, recuperación real, confirmación email.
- Imagen local, assets en `public/`, versión dinámica.
- Rate-limiting, RLS, tokens JWT, refresh, seguridad real.
- Animaciones complejas (`parallax`, `draw-line`, `hero-scrub`).