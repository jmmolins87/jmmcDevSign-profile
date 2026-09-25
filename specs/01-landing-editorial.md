# SPEC 01 — Landing editorial del portafolio en Next.js

> **Status:** Aprobado
> **Depends on:** — (primera spec)
> **Date:** 2026-09-25
> **Objective:** Portar la landing `references/01_landing/code.html` a Next.js 16 + Tailwind v4 como página `/`, fiel al `screen.png`, con paleta Paper y animaciones Anime.js.

## Por qué existe esta spec

El repositorio está en boilerplate de create-next-app y existe un HTML de referencia de 897 líneas con el diseño completo de la landing. Hace falta convertirlo en código real de Next.js sin perder fidelidad visual y sin arrastrar los problemas del HTML de partida (tokens de color que no coinciden con la paleta del proyecto, animaciones solo aparentes, formulario falso).

## Alcance

**In:**

- Página única `/` con las 8 secciones: hero, 01 Sobre mí, 02 Stack, 03 Experiencia, 04 Proyectos + demos en vivo, 05 Servicios, 06 Blog, 07 Contacto.
- Header fijo de 72px (wordmark JMMC, píldora ES|EN con EN inerte, botón de tema inerte, hamburguesa inerte, avatar circular) + footer + overlay de film grain.
- Tokens Tailwind v4 de Paper en `app/globals.css`, tipografías vía `next/font` (Newsreader, Geist, Geist Mono, Material Symbols Outlined).
- Contenido de las secciones como datos TS tipados en `lib/content.ts`.
- Animaciones Anime.js v4 sobre los hooks `data-anim` del HTML, con desactivación por `prefers-reduced-motion`.
- Formulario de contacto con validación nativa y estado de envío `[placeholder]`.
- Verificación con capturas Playwright a 1440px y 390px comparadas con `references/01_landing/screen.png`.

**Fuera de alcance (specs futuras):**

- i18n y traducciones.
- Overlay de menú hamburguesa y popover de tema (pantalla 01b). Los botones quedan inertes.
- Demos 02, 03 y 04; zona de miembros (05); editor del blog (06).
- Modo oscuro Night. El botón de tema queda inerte.
- Blog real (posts, rutas, MDX). El carousel es estático.
- Envío real del formulario (proveedor de email).
- Descarga de imágenes a `public/`. Se mantiene el hotlink.
- Contenido biográfico real.

## Modelo de datos

Estructuras de contenido nuevas, sin persistencia:

```ts
// lib/content.ts
export type StackGroup = {
  title: string;
  note: string;
  skills: { name: string; level: number; tag?: string }[];
};

export type TimelineEntry = {
  period: string;
  role: string;
  company: string;
  body: string;
  tags: string[];
};

export type Project = {
  index: string;
  category: string;
  title: string;
  body: string;
  tags: string[];
  image: string;
};

export type Service = {
  index: string;
  icon: string;
  title: string;
  body: string;
  meta: string;
};

export type DemoRow = {
  badge: string;
  live: boolean;
  title: string;
  body: string;
  href: string;
};

export type PostPeek = {
  category: string;
  title: string;
};
```

Convención: todo contenido de ejemplo lleva el comentario `// [placeholder]` en `lib/content.ts`, sin alterar la interfaz.

## Plan de implementación

1. **Fundación.** Definir los tokens de Paper en `app/globals.css` con `@theme`, cargar las 4 familias de fuente con `next/font`, y montar `app/layout.tsx` con header, footer y overlay de film grain. *Verificar:* `npm run build` termina sin errores y `/` renderiza el header de 72px.
2. **Contenido.** Crear `lib/content.ts` con los 6 tipos y los datos portados del HTML de referencia. *Verificar:* `npx tsc --noEmit` pasa.
3. **Hero.** Implementar la sección hero con `data-anim="hero-scrub"` y su hairline divisoria. *Verificar:* se ve la media panel 21:9 con las letterbox bars y el HUD editorial.
4. **Sobre mí y Stack.** Implementar la sección 01 y la 02 con las barras de progreso `data-anim="fill-bar"`. *Verificar:* las barras muestran 92, 85, 70, 75, 82, 80, 90, 65 y 85 %.
5. **Experiencia.** Implementar la sección 03 con la timeline de 4 entradas y `data-anim="draw-line"`.
6. **Proyectos y demos.** Implementar la sección 04: grid 2x2 de tarjetas + las 3 filas de demos con `data-anim="stagger-in"`.
7. **Servicios y Blog.** Implementar la sección 05 (4 tarjetas numeradas) y la 06 (carousel peeking estático con controles inoperativos).
8. **Contacto.** Implementar la sección 07 con el formulario de 3 campos y validación nativa. *Verificar:* no se dispara `alert()`.
9. **Animaciones.** Instalar `animejs`, implementar los 8 hooks `data-anim` declarados en las secciones y la desactivación por `prefers-reduced-motion`.
10. **QA visual.** Ejecutar `npm run lint` y `npx tsc --noEmit`, tomar capturas Playwright a 1440px y 390px, compararlas con `screen.png` y corregir todas las desviaciones detectadas en un solo lote.

## Criterios de aceptación

- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `/` renderiza las 8 secciones en el mismo orden que el HTML de referencia.
- [ ] El header es fijo, mide 72px y contiene los 5 elementos, sin enlaces de navegación inline en ningún breakpoint.
- [ ] Los estilos computados dan fondo `rgb(244, 239, 230)` y acento `rgb(232, 72, 43)`, sin clases `dark:` activas.
- [ ] Los labels de sección usan monoespaciada, mayúsculas y `tracking 0.06em` con formato `NN — NOMBRE`.
- [ ] Cada sección declara su atributo `data-anim` y su animación se dispara al entrar en el viewport.
- [ ] Las barras del stack arrancan en 0 % y alcanzan su porcentaje objetivo al hacer scroll.
- [ ] El formulario marca los 3 campos como `required`, el focus cambia la hairline a color acento y el envío no dispara `alert()`.
- [ ] Con `prefers-reduced-motion: reduce` no se ejecuta ninguna animación de scroll.
- [ ] Las capturas a 1440px y 390px no muestran desviaciones de jerarquía, ritmo ni alineación respecto a `screen.png`.
- [ ] No aparecen gradientes azul o violeta, blobs 3D ni iconos tipo emoji.
- [ ] Todo dato de ejemplo está marcado con `[placeholder]` en `lib/content.ts`.

## Decisiones

- **Sí:** paleta Paper `#F4EFE6` / `#E8482B` de las instrucciones del proyecto y del cuerpo de `DESIGN.md`. **No:** los tokens Material `#fff8f4` / `#b32107` que trae el HTML de referencia, que se remapean.
- **Sí:** mantener el hotlink de las imágenes. **No:** descargarlas a `public/` ahora. El riesgo de que la URL caduque queda asumido y anotado.
- **Sí:** Anime.js v4 real instalado como dependencia. **No:** el fallback vanilla con IntersectionObserver del HTML, que se conserva solo como comportamiento sin JavaScript.
- **Sí:** Material Symbols cargado con `next/font`. **No:** extraer SVGs inline o usar lucide-react, por fidelidad al `screen.png` y para evitar mantenimiento manual.
- **Sí:** píldora ES|EN visible en el header con EN inerte. **No:** instalar `next-intl` en esta spec.
- **Sí:** avatar circular al final del header, presente en el `screen.png`. **No:** aplicar el orden estricto de 4 elementos de las instrucciones de diseño. Aprobado por el usuario.
- **Sí:** conservar las sombras sutiles `shadow-lg` y `hover:shadow-xl` del HTML. **No:** interpretar la prohibición de sombras como aplicable a éstas, que son suaves y no difusas gigantes.
- **Sí:** carousel del blog estático con controles inoperativos. **No:** estado React con rotación de tarjetas.
- **Sí:** envío del formulario con estado `[placeholder]`. **No:** API route ni proveedor de email.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El remapeo de Material a Paper altera el contraste | Comparar capturas con `screen.png` y revisar el nivel AA en los labels sobre superficie |
| Las imágenes por hotlink pueden caducar | Decisión asumida; una spec futura de assets las localiza |
| Anime.js choca con la hidratación de SSR | Cargar con import dinámico y `ssr: false` en el cliente |
| `next/font` no cubre todos los glifos de Material Symbols | Verificar con Context7 los ~15 iconos usados antes de implementar |

## Lo que **no** está en esta spec

- Traducciones e i18n.
- Menú overlay y modo oscuro.
- Demos, zona de miembros y editor de blog.
- Blog real y envío real de correo.
- Assets locales y contenido biográfico real.
