# SPEC 09 — Blog editor: CMS editorial con toolbar, panel SEO y datos en memoria

> **Status:** Implementado
> **Depends on:** SPEC 01, SPEC 05
> **Date:** 2026-09-26
> **Objective:** Implementar la pantalla 06 (`references/06_editor_del_blog/`) como ruta `/blog/editor` con layout de dos paneles (8/4 columnas desktop), editor de texto enriquecido con toolbar funcional (inserta markdown), panel lateral de metadatos SEO y publicación, todo con estado en memoria y tema heredado Paper/Night.

## Por qué existe esta spec

La referencia `references/06_editor_del_blog/code.html` + `screen.png` define un editor editorial de blog con toolbar flotante, panel de metadatos SEO y preview de Google que no existe en el sitio. El portafolio enlaza la sección blog con `href="#"`. Hace falta convertir esa referencia en una ruta Next.js interactiva que demuestre capacidades de CMS — texto editable, toolbar que inserta markdown, contadores reales de palabras y SEO, slug auto-generado — pero **sin backend real**, todo en memoria, fiel al diseño editorial y coherente con las animaciones y tema global.

## Alcance

**In:**

- Ruta `/blog/editor` (App Router, `app/blog/editor/page.tsx`) con metadata editorial.
- **Sub-barra superior**: enlace "Volver al blog" (inerte), badge "Borrador" con punto terciario, "Guardado hace N s" con pulso CSS (tick simulado cada segundo), botones "Vista previa" (inerte), "Guardar" (inerte), "Publicar" (inerte).
- **Panel principal (8 columnas)**:
  - Imagen de portada 16:9 con overlay de toolbar (hover: "Cambiar imagen" + "Eliminar"), badge de alt text ("Alt text configurado (N palabras)"), dimensiones "2140 × 1204 px · 16:9".
  - Header editorial: categoría/slug breadcrumb (`Volumen IV · Ensayo / 15 min de lectura`), título editable (`textarea` Newsreader, 2 filas, placeholder "Escribe el título..."), excerpt/dek editable (`textarea` cursiva, placeholder "Escribe una bajada...").
  - **Toolbar funcional sticky** (`top-[80px]`): botones H1/H2/H3 (solo visual), negrita/cursiva/enlace/cita/código/imagen/listas — los botones de formato **insertan markdown real** en el textarea del cuerpo (`**texto**`, `_texto_`, `` `código` ``, `> cita`, `## título`), con indicador "activo" al clicar. Contador real de palabras y minutos de lectura (alineado a la derecha del toolbar).
  - **Cuerpo del artículo**: `contentEditable` div o `textarea` grande con contenido editorial de ejemplo (párrafos, pull quote, heading, inline code, nota de revisión). **Editable**: el usuario puede escribir y el contador de palabras se actualiza.
  - Pull quote estilizado con barra lateral accent, cita en cursiva, atribución.
  - Nota de revisión (callout con icono `edit_note`).
- **Panel lateral (4 columnas)**:
  - Módulo idioma: selector segmentado ES (activo) / EN (inerte).
  - Módulo slug: input editable con prefijo `/blog/`, botón "Copiar URL", hint "Se actualizará automáticamente si modificas el título principal" — **el slug se genera en tiempo real desde el título** (kebab-case, sin acentos).
  - Módulo categoría: select con 4 opciones, chips de tags (UI/UX, EDITORIAL, TYPOGRAPHY, SYSTEMS) con botón × para quitar y botón "Añadir" (inerte).
  - Módulo publicación: fecha programada "24 Octubre 2026, 10:00 CEST", link "Cambiar a inmediata" (inerte), badge "Programado".
  - Módulo alt text: textarea editable con contador de caracteres, badge "A11y OK".
  - Módulo SEO: meta título (input con contador `N / 60`, color cambia a error si > 60), meta descripción (textarea con contador `N / 160`), preview de Google simulado (título, URL breadcrumb, descripción truncada), puntuación `N/100` calculada desde longitud de título + descripción + alt text.
- **Animaciones Anime.js v4**: `fade-up` en paneles, `stagger-in` en módulos laterales. Respeta `prefers-reduced-motion`.
- **Tema**: hereda `data-theme` global (Paper/Night) — NO se fuerza a Paper.
- **Datos**: todo en memoria (`useState`), se resetea al recargar. Contenido de ejemplo marcado `// [placeholder]`.
- **Cableado de la landing**: cambiar el `href` de la fila blog en `lib/content.ts` de `"#"` a `"/blog/editor"`.
- **Verificación**: capturas Playwright a 1440px y 390px en `.playwright-mcp/09-blog-editor/after/` vs `screen.png`; `npm run lint` + `npx tsc --noEmit`.

**Fuera de alcance (specs futuras):**

- CMS completo con lista de artículos, edición de posts existentes, borrado, borradores.
- Backend real, Supabase, persistencia entre sesiones.
- Editor WYSIWYG con preview en vivo lado a lado.
- Subida real de imágenes (dropzone, Cloudinary, Supabase Storage).
- Publicación real, scheduling, newsletters.
- i18n (EN inerte, selector solo visual).
- Pantalla 07 (Editor del blog — esta es la pantalla 06; la 07 es otra pantalla pendiente).

## Modelo de datos

No hay estructuras persistentes. El estado es efímero (React `useState`):

```ts
// app/blog/editor/BlogEditorClient.tsx (estado local)
type EditorState = {
  title: string;                       // "Diseñar con código: hacia una sensibilidad editorial en el software"
  excerpt: string;                     // "Reflexiones sobre el equilibrio entre..."
  slug: string;                        // "disenar-con-codigo-sensibilidad-editorial" (auto-generado)
  body: string;                        // contenido markdown del cuerpo
  wordCount: number;                   // derivado de body
  readingTime: number;                 // derivado: ceil(wordCount / 200)
  coverAlt: string;                    // alt text de la portada
  seoTitle: string;                    // meta título
  seoDescription: string;              // meta descripción
  seoScore: number;                    // 0-100, derivado
  tags: string[];                      // ["UI/UX", "EDITORIAL", "TYPOGRAPHY", "SYSTEMS"]
  category: string;                    // "Ensayos de Diseño & Arquitectura"
  savedAgo: number;                    // segundos desde última simulación de guardado, arranca en 2
};
```

Convención: todo contenido de ejemplo lleva `// [placeholder]`. No se añade nada a `lib/data/`.

## Plan de implementación

1. **Ruta y página contenedora.** Crear `app/blog/editor/page.tsx` (Server Component) con metadata (`title: "Editor del blog · JMMC"`, `description: "Crea y edita artículos del blog"`), importar `BlogEditorClient` y renderizarlo. *Verificar:* `npm run build` pasa; `/blog/editor` responde 200.
2. **Sub-barra superior.** Crear `EditorTopBar.tsx`: enlace "Volver al blog", badge "Borrador", "Guardado hace N s" con tick de 1s (simulado, nunca cambia de "2"), botones inertes Vista previa/Guardar/Publicar. *Verificar:* renderiza a 1440px y 390px; el tick sube cada segundo desde 2.
3. **Panel principal — portada y header.** Crear `EditorCanvas.tsx`: imagen de portada 16:9 con overlay hover (cambiar/eliminar), badge alt text, dimensiones. Header con breadcrumb, título editable (`textarea`), excerpt editable (`textarea`). *Verificar:* título y excerpt son editables; la imagen tiene `data-alt` descriptivo; overlay aparece en hover.
4. **Toolbar funcional.** Crear `EditorToolbar.tsx`: botones H1/H2/H3 (visual), negrita/cursiva/enlace/cita/código/imagen/listas. Cada botón de formato **inserta markdown** en el cuerpo del editor (usando `document.execCommand` o manipulación de `selectionStart`/`selectionEnd` en textarea). Contador real de palabras y minutos de lectura. *Verificar:* clicar negrita inserta `**` alrededor del texto seleccionado o en la posición del cursor; el contador de palabras refleja el contenido real.
5. **Cuerpo del artículo.** Crear `EditorBody.tsx`: div `contentEditable` o textarea grande con contenido de ejemplo (párrafos, pull quote, heading, inline code, nota). Si es `contentEditable`, se parsea a markdown al cambiar; si es textarea, se renderiza el markdown como texto plano con estilos tipográficos. *Verificar:* el usuario puede escribir y el contador de palabras se actualiza en el toolbar.
6. **Panel lateral — módulos.** Crear `InspectorPanel.tsx` con 6 módulos: idioma, slug, categoría+tags, publicación, alt text, SEO. Slug auto-generado desde título (kebab-case, sin acentos, en tiempo real). SEO: contadores `N/60` y `N/160` con cambio de color a error, preview Google simulado, puntuación derivada. *Verificar:* cambiar el título actualiza el slug automáticamente; SEO score cambia al modificar título/descripción; copiar URL copia al clipboard.
7. **Animaciones.** `useLayoutEffect` en `BlogEditorClient`: `fade-up` en paneles (24px, 700ms, outExpo), `stagger-in` en módulos del inspector (delay 45ms). Todo anulado con `prefers-reduced-motion: reduce`. *Verificar:* con `reduce` no hay timelines; sin `reduce`, entrada escalonada visible.
8. **Cableado de la landing.** Cambiar el `href` de la fila blog en `lib/content.ts` de `"#"` a `"/blog/editor"`. *Verificar:* la fila navega al editor.
9. **QA visual.** Capturar 1440px y 390px en `.playwright-mcp/09-blog-editor/after/`, comparar con `screen.png`. Ejecutar `npm run lint` y `npx tsc --noEmit`. *Verificar:* cero desviaciones de jerarquía, tipografía, espaciado; cero errores.

## Criterios de aceptación

- [x] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [x] `/blog/editor` renderiza sub-barra (volver + badge + tick), portada 16:9 con overlay hover, header con título y excerpt editables, toolbar sticky, cuerpo del artículo, panel lateral con 6 módulos.
- [x] El título y el excerpt son editables (textarea con placeholder).
- [x] El toolbar inserta markdown real: negrita (`**`), cursiva (`_`), cita (`>`), código (backticks), headings (`##`) al hacer clic en los botones correspondientes.
- [x] El contador de palabras del toolbar refleja el contenido real del cuerpo y se actualiza al escribir.
- [x] El slug del panel lateral se auto-genera en tiempo real desde el título (kebab-case, sin acentos).
- [x] Los contadores SEO cambian de color a error cuando el título > 60 chars o la descripción > 160 chars.
- [x] La puntuación SEO (N/100) se deriva de la longitud del título, descripción y alt text.
- [x] El preview de Google muestra el título, URL breadcrumb y descripción truncada coherentes con los inputs.
- [x] El tick "Guardado hace N s" sube cada segundo desde 2 (simulado).
- [x] Los botones Vista previa, Guardar, Publicar, Cambiar a inmediata, Añadir tag y enlace EN son inertes (no navegan ni ejecutan acciones).
- [x] Copiar URL copia la URL completa al clipboard.
- [x] Los tags UI/UX, EDITORIAL, TYPOGRAPHY, SYSTEMS se pueden quitar con el botón ×.
- [x] Layout 8/4 columnas a 1440px, apilado a 390px.
- [x] Tema: hereda `data-theme` global; en Night cambia colores acorde; en Paper usa valores SPEC 01.
- [x] Animaciones: `fade-up` en paneles, `stagger-in` en módulos laterales; nada con `prefers-reduced-motion: reduce`.
- [x] La fila blog de la landing navega a `/blog/editor`.
- [x] Capturas Playwright 1440px/390px en `.playwright-mcp/09-blog-editor/after/` sin desviaciones vs `screen.png`.
- [x] Todo contenido de ejemplo marcado `// [placeholder]` en comentarios del componente.

## Decisiones

- **Sí:** toolbar funcional que inserta markdown (`**`, `_`, `>`, backticks, `##`). **No:** editor WYSIWYG con preview en vivo — demasiado alcance, merece otra spec.
- **Sí:** `contentEditable` o textarea con manipulación de `selectionStart`/`selectionEnd` para insertar markdown. **No:** librería de rich text externa (TipTap, Slate) — overengineering para una demo.
- **Sí:** slug auto-generado desde título en tiempo real (kebab-case, sin acentos). **No:** slug editable manualmente por ahora — el input existe pero se sincroniza con el título.
- **Sí:** puntuación SEO derivada (título ≤ 60 + descripción ≤ 160 + alt text presente = score alto). **No:** análisis SEO real (keyword density, legibilidad, etc.).
- **Sí:** tick "Guardado hace N s" simulado (siempre arranca en 2 y sube). **No:** simulación de guardado real con debounce — es visual, no funcional.
- **Sí:** tema heredado global (Paper/Night). **No:** forzar Paper — es pantalla editorial, no demo operativa.
- **Sí:** animaciones `fade-up` + `stagger-in` existentes. **No:** nuevas animaciones — la referencia solo declara `fade-up`.
- **Sí:** contenido de ejemplo hardcodeado en el componente con `// [placeholder]`. **No:** `lib/data/` para el editor — no hay lista de posts que gestionar.
- **Sí:** botones inertes (Vista previa, Guardar, Publicar, etc.) como affordances visuales. **No:** fabricar acciones mock con toasts — SPEC 05 rechazó affordances falsos, pero aquí son "guardar" y "publicar" que el usuario entiende como placeholders de un editor, no como features simuladas.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `contentEditable` es complejo de manejar con React | Usar textarea + manipulación de `selectionStart`/`selectionEnd` para markdown; más predecible y verificable |
| El overlay de la portada no aparece en hover en mobile | En mobile (≤ 768px) el overlay es siempre visible o se activa con touch; la referencia lo define como `group-hover` |
| El slug auto-generado con acentos españoles | Función de slug: `normalize("NFD").replace(/[\u0300-\u036f]/g, "")` + reemplazar espacios por guiones |
| La puntuación SEO es arbitraria | Fórmula simple y documentada: +30 título en rango, +30 descripción en rango, +20 alt text presente, +20 longitud mínima del cuerpo |
| El tick "Guardado hace N s" parece real pero no lo es | Es explícitamente simulado; el badge "Borrador" deja claro que no hay persistencia |
| QA visual: el contenido editable cambia la apariencia vs `screen.png` | Las capturas se hacen sin interactuar (estado inicial), igual que la referencia |

## Lo que **no** está en esta spec

- CMS completo, lista de artículos, edición de posts existentes, borrado, borradores.
- Backend real, Supabase, persistencia entre sesiones.
- Editor WYSIWYG, preview en vivo lado a lado.
- Subida real de imágenes, Cloudinary, Supabase Storage.
- Publicación real, scheduling, newsletters, i18n.
- Pantalla 07 y resto de pantallas pendientes.
