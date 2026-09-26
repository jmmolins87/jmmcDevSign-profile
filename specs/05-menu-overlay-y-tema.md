# SPEC 05 — Overlay de menú y selector de tema con modo Night

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 02, SPEC 04
> **Date:** 2026-09-26
> **Objective:** Activar la navegación de la landing con un overlay de menú a pantalla completa y un selector de tema Claro/Oscuro/Sistema que aplica la paleta Night en toda la landing con persistencia.

## Por qué existe esta spec

La SPEC 01 dejó el header con tres controles inertes (píldora `EN`, botón de tema, hamburguesa) y el modo oscuro fuera de alcance. La referencia `references/01b_landing_men_y_tema_estados/` trae el diseño de ambos estados: el overlay invertido con mapa de navegación, demos en vivo y conexiones, y el popover `Apariencia` con Claro/Oscuro/Sistema comprobado sobre los contextos Paper y Night. Hace falta convertirlos en comportamiento real sin tocar el diseño ya aprobado de la landing.

## Alcance

**In:**

- Overlay de menú a pantalla completo (`MenuOverlay.tsx`) abierto por la hamburguesa: mapa de navegación 01–07 con badge `ACTIVO` sobre la sección visible, columna de demos en vivo (reutilizando `demos` de `lib/content.ts`), tarjeta de zona de miembros, conexiones y pie `DISPONIBLE PARA Q2/Q3 2026 / MADRID & REMOTO`.
- Cierre del overlay con el botón ✕ de acento, `ESC` y cualquier enlace; `body` con `overflow: hidden` mientras está abierto; `role="dialog" aria-modal="true"` con foco inicial en el primer enlace, foco atrapado con Tab y retorno a la hamburguesa al cerrar.
- Selector de tema: píldora `icono + chevron` en el header (también dentro del overlay) y popover `Apariencia` con Claro / Oscuro / Sistema, check en la activa, cierre con click fuera y `ESC`, y cierre al elegir opción.
- Paleta Night completa redefiniendo las variables de `app/globals.css` bajo `html[data-theme="dark"]` (los 6 tokens base, teal oscuro `#5CC8BE` y film grain), sin ninguna clase `dark:` de Tailwind.
- Lógica de tema en `lib/theme.ts` + `ThemeProvider` en `layout.tsx`: preferencia `light | dark | system` persistida en `localStorage["theme:v1"]` (default `system`), script anti-parpadeo en el `<head>` y reacción en vivo a cambios de `matchMedia`.
- Badge `ACTIVO` del menú con `IntersectionObserver` siguiendo la sección visible en el scroll.
- Apertura del overlay con Anime.js v4 (`fade-up` + `stagger-label` a 45ms en la lista), anulada con `prefers-reduced-motion`.
- `lib/content.ts`: nuevo array `navItems` (7 entradas) con el mismo marcado `[placeholder]` del resto del contenido.
- Capturas Playwright a 1440px y 390px en `.playwright-mcp/05-menu-overlay-y-tema/after/`.

**Fuera de alcance (specs futuras):**

- i18n: `EN` sigue inerte en header y overlay.
- Remapeo de tokens de las demos: `/demos/leads` se fuerza a Paper (ver decisiones).
- La página-documento de la referencia (cabecera `01B — COMPONENTE ARQUITECTÓNICO`, marcos `CONTEXTO 1/2`, botón `Test Micro-interacción`): es la carcasa de la especificación, no una pantalla del sitio.
- Destinos inexistentes: demos 02/03 (`href="#"` inertes), zona de miembros, avatar y foto.
- Atajos de teclado del popover (el chip `TAB` de la referencia).
- Animación de cierre del overlay (el cierre es inmediato).
- Pantallas 02–06 restantes.

## Modelo de datos

Estructuras nuevas, sin persistencia propia (la única persistencia es la preferencia de tema):

```ts
// lib/content.ts
export type NavItem = { index: string; label: string; href: string };
export const navItems: NavItem[] = [
  { index: "01", label: "Sobre mí", href: "#sobre-mi" },
  // … 02 #stack, 03 #experiencia, 04 #proyectos,
  //   05 #servicios, 06 #blog, 07 #contacto
];
```

```ts
// lib/theme.ts
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export const THEME_KEY = "theme:v1"; // valor: ThemePreference
resolveTheme(pref: ThemePreference, prefersDark: boolean): ResolvedTheme;
applyTheme(resolved: ResolvedTheme): void; // documentElement.dataset.theme
```

Convención: las demos del menú se reutilizan de `demos` (`lib/content.ts`, ya marcados `[placeholder]`); cuyo `href` sea `"#"` quedan inertes. Los destinos de `navItems` corresponden a los `id` existentes: `sobre-mi`, `stack`, `experiencia`, `proyectos`, `servicios`, `blog`, `contacto`.

## Plan de implementación

1. **Lógica de tema.** Crear `lib/theme.ts` y `app/components/ThemeProvider.tsx` (contexto + hook `useTheme`), montar el provider y el script anti-parpadeo inline en el `<head>` de `app/layout.tsx`. *Verificar:* con el SO en oscuro, recargar `/` no muestra Paper antes que Night y `npx tsc --noEmit` pasa.
2. **Tokens Night.** Añadir en `app/globals.css` el bloque `html[data-theme="dark"]` con background `#0F0E0D`, surface `#181614`, ink `#F3EEE5`, muted `#A39C90`, hairline `#2B2723`, accent `#FF6A45`, teal `#5CC8BE` y el grain (`opacity` 0.05 con `mix-blend-screen`), más la redeclaración Paper bajo `[data-theme="light"]`. *Verificar:* con `data-theme="dark"`, `getComputedStyle(body)` da `rgb(15, 14, 13)` y el acento `rgb(255, 106, 69)`; sin el atributo, la landing conserva los valores de SPEC 01.
3. **Popover de tema.** Crear `app/components/ThemePopover.tsx` (píldora `icono + chevron` + popover con las 3 opciones) y sustituir el botón inerte del `Header`. *Verificar:* abrir/cerrar con click y `ESC`, elegir opción persiste tras F5 y el check marca la preferencia activa.
4. **Estructura del overlay.** Crear `app/components/MenuOverlay.tsx` con las dos columnas y el pie de la referencia, cableado a la hamburguesa del `Header`; cerrar con ✕ y `ESC`, bloquear scroll del body y gestionar foco. *Verificar:* la hamburguesa abre y cierra el overlay; con abierto, el body no hace scroll y `Tab` no alcanza el fondo.
5. **Navegación y estado activo.** Añadir `navItems` a `lib/content.ts`, hacer que los 7 enlaces cierren el overlay y scrolleen a su sección, marcar `ACTIVO` con `IntersectionObserver`, y dejar inertes demos con `href="#"`, zona de miembros, `EN` y avatar. *Verificar:* cada enlace lleva a su sección; el badge `ACTIVO` coincide con la visible en 3 posiciones de scroll; "Agente de leads" navega a `/demos/leads`.
6. **Animación de apertura.** Animar la entrada del overlay con `anime.js` (`fade-up` del panel + `stagger-label` a 45ms en la lista) y la del popover con transición CSS, ambos anulados con `prefers-reduced-motion`. *Verificar:* con `reduce`, el overlay aparece sin transición y no se crea ningún timeline.
7. **Fuerza Paper en demos.** En `ThemeProvider`, con `usePathname()` resolver a `light` en rutas `/demos/*` ignorando la preferencia. *Verificar:* con preferencia `dark`, `/demos/leads` se ve en Paper incluido el header.
8. **QA visual.** Capturar a 1440px y 390px: overlay abierto, popover abierto en Paper, landing en Night y `/demos/leads`, en `.playwright-mcp/05-menu-overlay-y-tema/after/`; comparar con `screen.png` y ejecutar `npm run lint` y `npx tsc --noEmit`. *Verificar:* cero desviaciones de jerarquía y cero errores.

## Criterios de aceptación

- [x] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [x] La hamburguesa abre el overlay; ✕, `ESC` y cualquier enlace lo cierran; con abierto `body` tiene `overflow: hidden`.
- [x] Con el overlay abierto, `Tab` nunca lleva el foco a elementos del fondo y al cerrar el foco vuelve a la hamburguesa.
- [x] Los 7 enlaces del mapa hacen scroll a `#sobre-mi` … `#contacto` y cierran el overlay.
- [x] El badge `ACTIVO` marca la sección visible al hacer scroll (verificado en 3 posiciones distintas).
- [x] "Agente de leads" navega a `/demos/leads`; las otras 2 demos, zona de miembros, `EN` y avatar no navegan ni rompen el foco.
- [x] El popover alterna con la píldora, se cierra con click fuera y `ESC`, y elegir una opción aplica el tema y lo cierra.
- [x] La preferencia persiste en `localStorage["theme:v1"]` tras recargar; con `system` sigue al SO y reacciona en vivo a un cambio de `matchMedia`.
- [x] Con el SO en oscuro no se ve Paper antes que Night al cargar (sin FOUC).
- [x] Con `data-theme="dark"` los estilos computados dan background `rgb(15, 14, 13)` y acento `rgb(255, 106, 69)`; en light siguen siendo `rgb(244, 239, 230)` y `rgb(232, 72, 43)`.
- [x] `/demos/leads` se muestra íntegramente en Paper (incluido el header) con la preferencia en `dark`.
- [x] Con `prefers-reduced-motion: reduce` el overlay abre sin transición y el popover sin animación.
- [x] No aparece ninguna clase `dark:` de Tailwind en el código.
- [x] Las capturas a 1440px y 390px no muestran desviaciones respecto a `screen.png` y viven en `.playwright-mcp/05-menu-overlay-y-tema/after/`.
- [x] Todo dato de ejemplo sigue marcado con `[placeholder]` en `lib/content.ts`.

## Decisiones

- **Sí:** Night completo con variables CSS redefinidas bajo `html[data-theme="dark"]`. **No:** clases `dark:` por componente — SPEC 01 las excluye y duplicaría el remapeo en cada sección.
- **Sí:** atributo `data-theme` en `<html>` en vez de la clase `dark`. **No:** tocar `className` desde el script anti-parpadeo, que React gestiona y provoca warnings de hidratación.
- **Sí:** persistencia en `localStorage["theme:v1"]` (`light|dark|system`, default `system`) con script inline en `<head>`. **No:** cookie — no hay lectura server-side que la aproveche y el script ya resuelve el parpadeo.
- **Sí:** forzar `light` en `/demos/*` vía `usePathname()`. **No:** remapear los tokens de la SPEC 04 en esta spec.
- **Sí:** badge `ACTIVO` con `IntersectionObserver` (`rootMargin` −45%/−50%). **No:** estático en `Experiencia` como en la captura.
- **Sí:** diálogo modal con foco atrapado y `overflow: hidden` en el body. **No:** dejar el foco salir al fondo con el overlay abierto.
- **Sí:** animación de apertura con Anime.js (`fade-up` + `stagger-label` 45ms). **No:** animación de cierre ni animar el scroll de la página.
- **Sí:** omitir el chip `TAB` del popover de la referencia. **No:** mostrar una pista de atajo que no se implementa (affordance falso).
- **Sí:** avatar `person` también en el header del overlay. **No:** las iniciales `JM` de la referencia, para que el header no cambie de identidad al abrir el menú.
- **Sí:** píldora de tema `icono + chevron` sin texto, como el header aprobado de SPEC 01. **No:** etiquetas `TEMA`/`NOCHE`, que ensanchan el header en 390px; el popover ya etiqueta las opciones.
- **Sí:** reutilizar `demos` de `lib/content.ts` en el menú (los `href="#"` quedan inertes). **No:** duplicar la lista de demos dentro del overlay.
- **Sí:** grain con `mix-blend-screen` y `opacity` 0.05 bajo Night. **No:** `mix-blend-multiply`, que sobre `#0F0E0D` anula el grano; Paper conserva su valor actual sin regresión.
- **Sí:** la página-documento 01b queda fuera de alcance. **No:** montar la spec sheet como ruta del sitio.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Parpadeo a Paper antes de aplicar Night | Script inline en `<head>` antes del body; criterio de aceptación con SO en oscuro |
| React sobreescribe atributos tocados por el script | Se modifica `data-theme`, atributo que React no renderiza |
| Algún utilitario de `@theme` quedó con el valor embebido y no reacciona a la variable | QA con `getComputedStyle` sobre los 6 tokens; si aparece, forzar el paso por `var()` |
| El scroll-spy marca mal en móvil, donde las secciones son cortas | `rootMargin` −45%/−50% y verificación del badge en 3 posiciones |
| El foco se pierde al cerrar el overlay con `ESC` | Retorno explícito al botón hamburguesa, verificado en aceptación |
| La fuerza Paper de `/demos/*` se olvida al añadir rutas nuevas | El filtro es por prefijo `/demos/`, no por ruta concreta |

## Lo que **no** está en esta spec

- i18n real (`EN` inerte), remapeo de tokens de las demos y la página-documento 01b.
- Destinos no existentes: demos 02/03, zona de miembros, avatar y foto.
- Atajo `TAB` del popover, animación de cierre y pantallas 02–06 restantes.
