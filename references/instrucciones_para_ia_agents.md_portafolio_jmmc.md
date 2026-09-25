# INSTRUCCIONES PARA AGENTES DE IA (AGENTS.md)
## Proyecto: Portafolio Editorial & Cinematográfico — JMMC (Juanma)

Este documento define la arquitectura, directrices de diseño, tokens de interfaz y especificaciones técnicas completas para cualquier agente de IA o desarrollador que implemente, extienda o mantenga el portafolio de JMMC.

---

### 1. Filosofía y Dirección de Arte
- **Estilo**: *Editorial meets Cinematic*. Calmado, confiado, cálido y con tensión dramática.
- **Anti-patrones estrictos**:
  - Prohibidos los gradientes azules/violetas saturados de SaaS genérico.
  - Prohibido el glassmorphism excesivo y los blobs flotantes 3D.
  - Prohibidos los iconos tipo emoji o 3D hinchados.
  - Prohibido el cliché de "hero centrado + 3 tarjetas de features".
  - Prohibidos los bordes pesados con sombras difusas gigantes; se utilizan **líneas capilares (hairlines) de 1px** y contraste tipográfico asimétrico.
- **Grilla y ritmo**:
  - Grilla de 12 columnas (máximo ancho 1280px centrado con padding horizontal generoso).
  - Ritmo vertical de secciones: 96px a 160px.
  - Radios: `rounded-[14px]` en tarjetas, `rounded-full` en píldoras y chips.

---

### 2. Paleta de Color y Tokens Semánticos

#### Tema Claro ("Paper" — Default)
- **Fondo base (`bg-background`)**: `#F4EFE6` (Papel cálido natural con sutil textura)
- **Superficie / Tarjetas (`bg-surface`)**: `#FBF8F2`
- **Tinta / Texto principal (`text-ink`)**: `#15120F`
- **Texto atenuado (`text-muted`)**: `#6B645A`
- **Hairlines / Bordes (`border-hairline`)**: `#DDD5C6`
- **Acento / Marca (`bg-accent`)**: `#E8482B` (Rojo cinematográfico cálido)
- **Acento para texto (`text-accent`)**: `#B93013` (Garantiza accesibilidad WCAG AA)

#### Tema Oscuro ("Night")
- **Fondo base**: `#0F0E0D`
- **Superficie**: `#181614`
- **Tinta / Texto**: `#F3EEE5`
- **Texto atenuado**: `#A39C90`
- **Hairlines**: `#2B2723`
- **Acento**: `#FF6A45`

#### Tonos Secundarios (Exclusivos para analítica, tags y gráficas)
- **Teal**: `#1F7A72` (Modo oscuro: `#5CC8BE`)
- **Ochre / Ámbar**: `#D9A441`

---

### 3. Tipografía y Escala Jerárquica

1. **Display / Titulares**: `Instrument Serif` (Google Fonts / CDN).
   - Uso de cursiva editorial (`italic font-serif`) para enfatizar exactamente una palabra clave por titular.
2. **Cuerpo e Interfaz**: `Geist Sans` o `Inter` / sans geométrica limpia (`system-ui`).
3. **Etiquetas, Métricas, Fechas y Código**: `Geist Mono` / monospace limpio.
   - Regla obligatoria: Siempre en mayúsculas, tamaño 11px - 12px, tracking expandido (`tracking-[0.06em]` o `tracking-widest`).

---

### 4. Cabecera Global Persistente (Header)
- **Altura**: 72px fija, sticky top con `backdrop-blur-md` sobre superficie translúcida en scroll.
- **Estructura fija (sin links de navegación inline)**:
  - **Izquierda**: Wordmark `JMMC` en tipografía serif.
  - **Derecha (en este estricto orden)**:
    1. Selector de idioma segmentado: `ES | EN`.
    2. Botón desplegable de tema (icono Sol/Luna/Monitor + chevron).
    3. Botón de menú hamburguesa (dos líneas delgadas de 1.5px).
- **Regla inviolable**: NUNCA renderizar enlaces de navegación horizontales (`Sobre mí`, `Proyectos`, etc.) en el header en ningún breakpoint. Toda la navegación vive dentro del overlay de pantalla completa del menú hamburguesa.

---

### 5. Especificación de Páginas del Portafolio

| # | Identificador | Nombre de Pantalla | Propósito |
|---|---------------|--------------------|-----------|
| 1 | `01 — Landing` | Landing Page Principal | Hero cinematográfico en scroll pinned, Sobre mí, Stack con barras interactivas, Experiencia en timeline, Proyectos (2x2) + Demos en vivo, Servicios, Blog carrusel peeking, Contacto asimétrico. |
| 1b| `01b — Landing · menú y tema` | Estados de Landing | Superposición modal fullscreen invertida (ink/paper) del menú hamburguesa + popover de selector de tema Claro/Oscuro/Sistema. |
| 2 | `02 — Demo Agente de leads` | Demo Interactiva 1 | Aplicación SaaS de prospección: barra slim de retorno, KPIs mono, kanban interactivo de 4 columnas, panel lateral con desglose de IA y feed de actividad en vivo. |
| 3 | `03 — Demo Pedidos en tiempo real` | Demo Interactiva 2 | Tablero operativo para comercios: indicador sincronizado en vivo, columnas de pedidos (Nuevo/Preparación/Listo), tarjeta resaltada con actualización reactiva y panel de orden seleccionada. |
| 4 | `04 — Demo Software de gestión` | Demo Interactiva 3 | Panel SaaS integral (ERP/CRM): 4 KPIs mono, gráfico lineal de ingresos (accent + teal), tabla con estados capilares, lista de stock bajo y citas. |
| 5 | `05 — Zona de miembros` | Pantalla de Autenticación | Split screen 50/50: mitad izquierda imagen cinematográfica con viñeta y cita editorial; mitad derecha formulario de acceso, toggle mágico y validación inline. |
| 6 | `06 — Editor del blog` | CMS / Editor de Artículos | Vista de edición: barra superior de publicación, dropzone 16:9, inputs editoriales gigantes, toolbar flotante y panel lateral con metadatos SEO y taxonomía. |
| M | `0N — <Nombre> (mobile)` | Variantes Móviles (390px) | Adaptación responsive de 1 columna, táctiles de 44px, titulares 48-56px, carrusel peeking y drawer/bottom-sheet para paneles densos. |

---

### 6. Sistema de Movimiento y Coreografía (Anime.js v4)

Todas las pantallas deben incluir en su HTML los atributos semánticos `data-anim` para su enlace directo con Anime.js v4:
```html
<script type="module">
  import { animate, onScroll, createTimeline, stagger, splitText } from "https://cdn.jsdelivr.net/npm/animejs@4/+esm";
  // Coreografía vinculada a scroll y eventos
</script>
```

#### Diccionario de Hooks `data-anim`:
- `data-anim="hero-scrub"`: Para la secuencia fija (pinned) del hero (0–20% texto, 20–70% expansión de máscara y dolly-in, 70–100% desvanecimiento).
- `data-anim="reveal-lines"`: Titulares y textos que se revelan línea a línea mediante máscaras de overflow.
- `data-anim="clip-reveal"`: Imágenes y contenedores que abren su `clip-path` al entrar en viewport.
- `data-anim="draw-line"`: Líneas de timeline o hairlines que se dibujan progresivamente.
- `data-anim="fill-bar"`: Barras de habilidades de 6px que se llenan con retardo escalonado (`stagger`).
- `data-anim="count-up"`: Métricas y números mono que realizan recuento progresivo.
- `data-anim="stagger-in"`: Tarjetas y elementos en grilla que entran en cascada vertical.
- `data-anim="parallax"`: Desplazamiento multicapa con ratios `0.3x / 0.6x / 1.0x`.

---

### 7. Reglas de Exportación y Mantenimiento
1. Todo código HTML generado debe usar clases estándar de Tailwind CSS combinadas con las variables de color del sistema (`--bg-paper`, `--text-ink`, `--color-accent`, etc.).
2. Mantener siempre accesibilidad con soporte para `@media (prefers-reduced-motion: reduce)`.
3. Todos los datos de demostración o ejemplos deben marcarse claramente con `[placeholder]` para su reemplazo en producción.
