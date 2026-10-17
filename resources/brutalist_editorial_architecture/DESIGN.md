---
name: Brutalist Editorial Architecture
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#cac6bd'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#939188'
  outline-variant: '#484740'
  surface-tint: '#cac6bf'
  primary: '#ffffff'
  on-primary: '#31302b'
  primary-container: '#e6e2da'
  on-primary-container: '#66645e'
  inverse-primary: '#605e58'
  secondary: '#cbc6bc'
  on-secondary: '#333029'
  secondary-container: '#49473f'
  on-secondary-container: '#b9b5ab'
  tertiary: '#ffffff'
  on-tertiary: '#5e1700'
  tertiary-container: '#ffdbd0'
  on-tertiary-container: '#b83600'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e6e2da'
  primary-fixed-dim: '#cac6bf'
  on-primary-fixed: '#1c1c17'
  on-primary-fixed-variant: '#484741'
  secondary-fixed: '#e8e2d7'
  secondary-fixed-dim: '#cbc6bc'
  on-secondary-fixed: '#1d1b15'
  on-secondary-fixed-variant: '#49473f'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#852400'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  surface-dark: '#131316'
  hairline-dark: '#26262B'
  bg-light: '#EFEBE3'
  surface-light: '#E6E1D7'
  text-light: '#0C0C0E'
  muted-light: '#6B675F'
  hairline-light: '#D3CEC3'
  accent-text-light: '#B8350A'
typography:
  display-hero:
    fontFamily: Oswald
    fontSize: 96px
    fontWeight: '700'
    lineHeight: 92px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Oswald
    fontSize: 52px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Oswald
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 64px
    letterSpacing: -0.01em
  headline-xl-mobile:
    fontFamily: Oswald
    fontSize: 38px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: 0em
  headline-lg:
    fontFamily: Oswald
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Oswald
    fontSize: 26px
    fontWeight: '500'
    lineHeight: 30px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  mono-bracket:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.04em
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Oswald
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 3rem
  space-2xl: 5rem
---

## Brand & Style

This design system embodies an uncompromising brutalist editorial and architectural discipline tailored for senior fullstack engineering and avant-garde digital design. It rejects decorative skeuomorphism, rounded bubble treatments, and ambient diffused shadows in favor of raw structural clarity, dense typographic tension, and precision engineering. 

The tone is authoritative, cerebral, and rigorously utilitarian. It speaks to art directors, founders, and technical leads who respect deliberate craftsmanship, systemic exactitude, and code-native artifacts. Visual motifs lean heavily into technical blueprints: exposed hairlines, visible layout bounds, monospaced metadata nested within programmatic curly brackets `{ ... }`, and an asymmetric editorial grid. A singular, hyper-saturated four-point star accent interrupts the disciplined monochrome structure, denoting operational vitality, production readiness, and active state changes.

## Colors

The system uses an inverted technical palette rooted in deep obsidian, warm archival chalk, and high-velocity international orange.

### Color Modes & Hierarchy
- **Dark Mode (Default Canvas):** The backdrop is rooted in `#0C0C0E` with structural panels elevated to `#131316`. Typography and glyphs lead with chalk white (`#EFEBE3`), while secondary technical captions utilize muted slate (`#8A867D`). Grid subdivisions, table boundaries, and frame rules are rendered in razor-sharp `#26262B` hairlines.
- **Light Mode (Editorial Parchment):** The canvas flips to warm paper `#EFEBE3` with elevated panels in `#E6E1D7`. Structural content uses carbon black (`#0C0C0E`), secondary text shifts to stone gray (`#6B675F`), and dividing hairlines rest at `#D3CEC3`.
- **Accent Application (`#FF5A1F`):** Used with surgical constraint. It is strictly reserved for the signature four-point star icon (`✦`), live deployment pulses, operational status indicators, and active navigational pips. It must never be applied to large decorative surfaces or common body copy. In Light Mode, when legibility demands higher contrast for accent text markers, `#B8350A` is substituted.

## Typography

Typography establishes an architectural hierarchy spanning dense editorial monumentality to terminal data syntax.

- **Headlines (`Oswald`):** Ultra-condensed, flat-cut, uppercase grotesk. Headlines are styled in uppercase to evoke physical signage and brutalist editorial publications. Tight tracking and negative line-height margins generate massive structural blocks of text.
- **Body Copy (`Hanken Grotesk`):** Contemporary, low-friction grotesk delivering high legibility across dense architectural narratives, case studies, and engineering breakdowns.
- **Technical Metadata & Notation (`JetBrains Mono`):** Applied to indexing tokens, data tables, metrics, commit SHAs, and braced structural annotations. Numerals and project counts are systematically wrapped in bracket syntax: `{ 01 / 09 }`, `{ STATUS: DEPLOYED }`, `{ 2024 }`.

## Layout & Spacing

The structural layout utilizes an asymmetric, modular grid derived from editorial broadsheets and blueprint registers.

### Grid & Composition
- **Desktop (1024px+):** 12-column asymmetric grid. Columns frequently snap into uneven ratios (e.g., 5-column technical dossier alongside a 7-column media frame). Gutters are `1.5rem` (`gutter-desktop`) with canvas margins set to `3rem` (`margin-desktop`).
- **Tablet (768px – 1023px):** 6-column grid; outer margins contract to `2rem` (`margin-tablet`), gutters adjust to `1rem`.
- **Mobile (Up to 767px):** 4-column linear stack. Outer margins contract to `1rem` (`margin`). Internal elements fill the screen width between hairline structural dividers.

### Structural Hairline Dividers
Negative space is deliberately partitioned by 1px visible perimeter borders rather than arbitrary white space gaps. Sections terminate with visible coordinates, crosshairs, or bracket markers `{ + }` placed directly at grid intersections.

## Elevation & Depth

This system is completely planar and anti-skeuomorphic. Depth is achieved through tonal contrast, overlapping vector planes, and hard hairline enclosures rather than diffusion.

- **Shadows:** Strictly forbidden. No drop shadows, ambient box-shadows, or inner blurs exist.
- **Hairlines:** 1px solid borders (`#26262B` in dark mode, `#D3CEC3` in light mode) define every component boundary, list row, and layout partition.
- **Z-Index & Overlay:** Flyouts, modal drawers, and fixed navigation bars sit directly on `#131316` surface backgrounds enclosed by a 1px solid `#EFEBE3` or `#26262B` hairline stroke.
- **State Changes:** Hover and focus states never float upward on the Y-axis. They invert color palettes immediately (e.g., text and surface invert from dark-on-light to light-on-dark) or reveal solid accent hairline trims.

## Shapes

The geometry of the interface is unyielding, razor-sharp, and absolute.

- **Corner Radius:** `0px` universal across all viewports and components. No pill buttons, no soft card corners, and no rounded interactive badges are permitted.
- **Accent Glyph Geometry:** The signature four-point star accent (`✦`) utilizes a diamond-concave geometry constructed via tight quadratic pinch points, matching the precision vector path of the master monogram mark.
- **Dividers & Marks:** Dividers are unbroken horizontal and vertical 1px vectors. Crosshairs, tick marks, and angled diagonal lines (`/`) act as structural separators.

## Components

### Buttons & Interactive Triggers
- **Geometry:** 0px radius rectangular slabs.
- **Primary:** Solid `#EFEBE3` background with `#0C0C0E` condensed uppercase text (`label-caps`). On hover, instantaneous color inversion to `#0C0C0E` background with `#EFEBE3` text and a 1px solid `#EFEBE3` hairline border.
- **Secondary / Ghost:** Transparent background enclosed by a 1px `#26262B` border, styled with monospaced metadata prefixes: `[ READ CASE STUDY ]` or `{ VIEW SOURCE }`.
- **Accent Trigger:** Accompanied by the solid `#FF5A1F` four-point star positioned immediately adjacent to the label.

### Form Inputs & Checkboxes
- **Input Fields:** Unenclosed or bottom-hairline-only containers with a subtle `#131316` background fill. Active focus reveals an immediate 1px solid `#FF5A1F` or `#EFEBE3` border. Typography inside inputs utilizes `mono-code`.
- **Checkboxes & Radios:** Monolithic square boxes (`14px × 14px`) with sharp 0px corners and a 1px hairline border. The checked state is represented by an inverted solid fill containing a centralized miniature 4-point star or a stark ASCII cross (`X`).

### Cards & Dossiers
- **Structure:** Framed strictly with a 1px hairline border (`#26262B`). The top margin header of each card contains a technical status ribbon featuring monospaced indexing `{ 01 }` at the far left and the project category or status at the far right.
- **Media Containers:** Image and video containers are framed edge-to-edge within the 1px card frame. No internal padding separates media from the bounding structural borders.

### Lists & Index Rows
- **Layout:** High-density, horizontal editorial ledger rows partitioned by 1px bottom hairlines.
- **Content Flow:** Columns align vertically: Index `{ 01 }` | Project Name (Condensed Grotesk) | Discipline Tag | Year | External Link Arrow `->`.
- **Hover Behavior:** Full-row background shifts to `#131316` instantaneously, shifting the index number color to the accent `#FF5A1F`.

### Status Indicators & Badges
- **Status Markers:** A pulsing `#FF5A1F` 6px square or four-point star accompanied by monospaced uppercase technical copy: `{ STATUS: ALL SYSTEMS OPERATIONAL }` or `{ LIVE DEPLOYMENT }`.
- **Pill Ban:** Rounded badges are completely prohibited; all badges are hard-cornered micro-boxes wrapped in square brackets `[ ARCHITECTURE ]`.