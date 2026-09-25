---
name: Editorial Cinematic
colors:
  surface: '#fff8f4'
  surface-dim: '#e0d9d3'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2ec'
  surface-container: '#f5ece7'
  surface-container-high: '#efe7e1'
  surface-container-highest: '#e9e1db'
  on-surface: '#1e1b18'
  on-surface-variant: '#5b403b'
  inverse-surface: '#34302c'
  inverse-on-surface: '#f8efea'
  outline: '#8f706a'
  outline-variant: '#e3beb7'
  surface-tint: '#b62409'
  primary: '#b32107'
  on-primary: '#ffffff'
  primary-container: '#d63b20'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb4a5'
  secondary: '#006a63'
  on-secondary: '#ffffff'
  secondary-container: '#9cefe4'
  on-secondary-container: '#086f67'
  tertiary: '#7a5500'
  on-tertiary: '#ffffff'
  tertiary-container: '#996c04'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad3'
  primary-fixed-dim: '#ffb4a5'
  on-primary-fixed: '#3e0400'
  on-primary-fixed-variant: '#8e1400'
  secondary-fixed: '#9ff1e7'
  secondary-fixed-dim: '#83d5cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#00504a'
  tertiary-fixed: '#ffdeaa'
  tertiary-fixed-dim: '#f5bd58'
  on-tertiary-fixed: '#271900'
  on-tertiary-fixed-variant: '#5f4100'
  background: '#fff8f4'
  on-background: '#1e1b18'
  surface-variant: '#e9e1db'
typography:
  display-xl:
    fontFamily: Newsreader
    fontSize: 96px
    fontWeight: '400'
    lineHeight: 100px
    letterSpacing: -0.03em
  display-xl-mobile:
    fontFamily: Newsreader
    fontSize: 52px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Newsreader
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 68px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 44px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 38px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 30px
  body-lg:
    fontFamily: Geist
    fontSize: 19px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.06em
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
The design system positions the practitioner at the intersection of rigorous engineering and refined creative direction. Built for a dual-discipline fullstack developer and UI/UX designer, the experience rejects noisy tech aesthetics in favor of a calm, authoritative, and cinematic editorial tone. It evokes the tactile confidence of fine print journals, gallery publications, and art-house cinema reels.

The aesthetic philosophy balances disciplined asymmetry with monumental typography and deliberate stillness. Structure is communicated strictly through generous negative space and precise 1px architectural hairlines rather than decorative elevation or heavy box-shadows. Motion follows director-level restraint: deliberate cinematic reveals, quiet fades, and purposeful content shifts triggered via declarative animation targets.

## Colors

The system uses two dedicated atmospheric modes: **Paper** (light mode, default) and **Night** (dark mode). The color relationships are tuned for editorial reading, tactile warmth, and high-fidelity project showcases.

### Paper (Default / Light)
- **Background Canvas**: `#F4EFE6` (Warm, fibrous unbleached paper)
- **Surface**: `#FBF8F2` (Lifted card containers and subtle modules)
- **Ink (Text Primary)**: `#15120F` (Deep carbon black with organic brown base)
- **Muted Text**: `#6B645A` (Warm editorial stone for metadata and body secondary)
- **Hairline / Rule**: `#DDD5C6` (Structural 1px dividers and container frames)
- **Accent (Interactive & Graphical)**: `#E8482B` (Vermilion cinnabar)
- **Accent for Text (Accessible on Paper)**: `#B93013` (Deepened vermilion for high-legibility typographic links and micro-accents)

### Night (Dark)
- **Background Canvas**: `#0F0E0D` (Deep cinematic void with warm undertones)
- **Surface**: `#181614` (Elevated basalt tone)
- **Ink (Text Primary)**: `#F3EEE5` (Warm bone white)
- **Muted Text**: `#A39C90` (Weathered parchment gray)
- **Hairline / Rule**: `#2B2723` (Quiet structural line)
- **Accent**: `#FF6A45` (Vibrant electric cinnabar)

### Secondary & Semantic Tones
- **Secondary (Teal)**: `#1F7A72` (Light) / `#5CC8BE` (Dark) — designates system architecture, backend logic, and engineering achievements.
- **Tertiary (Ochre)**: `#D9A441` — indicates design theory, case study highlights, and contextual awards.

## Typography

The typographical hierarchy is intentionally stark and editorial:

1. **Display & Editorial Headlines**: Rendered in high-character serif (`Newsreader` / *Instrument Serif* profile). Used unitalicized for architectural scale and italicized sparingly for emphasis, quotes, and project meta statements. Display titles embrace tight tracking and deliberate negative leading.
2. **Body & Interface**: Rendered in `Geist`. Provides pure geometric precision, clear tabular rhythm, and invisible legibility across long-form case studies and UI controls.
3. **Labels & Metadata**: Rendered in `JetBrains Mono` (*Geist Mono* profile). All structural labels, index counts, status markers, tags, and category chips must be strictly `uppercase` with `+6%` (`0.06em`) letter spacing to preserve technical authority.

## Layout & Spacing

The structural layout uses a disciplined 12-column grid capped at a maximum width of `1280px`, centered within the viewport.

### Breakpoints & Adaptive Logic
- **Desktop (`>= 1024px`)**: 12 columns, `gutter: 1.5rem` (24px), `margin: 3rem` (48px). Editorial columns favor asymmetry (e.g., 4-column sticky meta overview paired with an 8-column case narrative).
- **Tablet (`768px - 1023px`)**: 8 columns, `gutter: 1.25rem` (20px), `margin: 2rem` (32px).
- **Mobile (`< 768px`)**: 4 columns, `gutter-mobile: 1rem` (16px), `margin-mobile: 1.25rem` (20px). Layout stacks vertically with horizontal rules delineating module transitions.

### Macro Spacing Rhythm
Vertical rhythm relies on generous intervals:
- Section separators: `6rem` to `10rem` (96px - 160px).
- Project artifact separation: `3rem` to `5rem` (48px - 80px).
- Intra-component rhythm follows the base `space-*` scale strictly for inner pads and metadata grouping.

## Elevation & Depth

The design system rejects drop shadows, blurs, and skeuomorphic layered cards. Visual separation and plane hierarchy are created through:

1. **1px Structural Hairlines**: All containers, modules, and section borders are separated exclusively by solid 1px strokes using `#DDD5C6` (Paper) and `#2B2723` (Night).
2. **Surface Contrasts**: Elevated context relies on background shifts from background canvas (`#F4EFE6` / `#0F0E0D`) to surface (`#FBF8F2` / `#181614`).
3. **Film Grain Texture**: A fixed, low-opacity (2.5% on Paper, 3.5% on Night) SVG noise overlay covers the viewport to mimic analog film stock, eliminating digital sterility.
4. **Cinematic Aspect Ratios**: Media visual containers are strictly cropped to `21:9` (ultrawide panoramic hero viewports) or `16:10` (focused UI and production interaction captures) with `overflow: hidden`.

## Shapes

The shape vocabulary is strictly dual-form:

- **Cards and Panels**: Hard-coded to `14px` border radius (`border-radius: 14px`). This provides an architectural curve that softens the high-contrast 1px perimeter line without feeling juvenile or bubble-like.
- **Pills & Badges**: Fully rounded (`border-radius: 9999px`) for interactive state toggles, language switchers, and skill indicators.
- **Rules & Dividers**: Crisp, non-rounded vector lines of exactly 1px thickness.

## Components

### Global Header
- **Positioning**: Sticky top, `height: 72px`, z-index 100.
- **Styling**: Translucent surface backed by subtle hairline border along the bottom edge. No drop shadows.
- **Layout**: Left-aligned wordmark `'JMMC'` in display serif (`Newsreader`, 22px, tracking normal).
- **Controls (Right-aligned, flex-row)**:
  1. *Language Switcher*: Compact pill button displaying `ES | EN` in `label-caps`. Active locale highlighted in ink; inactive in muted.
  2. *Theme Dropdown / Toggle*: Hairline-bordered 36px circular or pill button with minimal icon indicator.
  3. *Menu Trigger*: Dedicated hamburger button consisting of two thin 1px lines (18px wide, 5px gap). No textual label. No inline nav links are exposed in the header bar.

### Buttons
- **Primary**: Solid accent background (`#E8482B` Paper / `#FF6A45` Night), ink-colored contrasting label in `label-caps` or medium-weight body text. Border radius: 9999px (pill) or 14px for full-width action blocks. Padding: `12px 24px`.
- **Secondary / Ghost**: Transparent background with 1px hairline border (`#DDD5C6` / `#2B2723`). On hover, the hairline and text shift smoothly to the accent tone.

### Project & Media Cards
- **Container**: `border-radius: 14px`, 1px solid hairline frame, surface background fill.
- **Image Cropping**: Nested image container locked to `16:10` or `21:9` aspect ratio. Images feature a subtle desaturation (10-15%) that transitions to full cinematic saturation on hover.
- **Card Content**: Padding `space-lg` (24px). Contains uppercase category label, serif project title, brief technical stack summary, and an explicit arrow link.

### Chips & Meta Badges
- **Style**: Fully pill-shaped (`9999px`), padding `4px 12px`.
- **Typography**: Strictly `label-caps` (`JetBrains Mono`, 11px, tracking `0.06em`, uppercase).
- **Colors**: 1px hairline outline with zero background fill, or filled with 5% opacity tint of Secondary (Teal) or Tertiary (Ochre) for role categorization.

### Form Inputs
- **Base**: Borderless input with a prominent 1px hairline bottom border or 14px enclosed surface frame.
- **Focus State**: Hairline transitions from neutral to accent (`#E8482B` / `#FF6A45`) without browser-native outline rings.
- **Typography**: Clean `Geist` body text with `JetBrains Mono` field indicators.

### Animation Directives (Anime.js v4 Hooks)
Interactive elements declare animation intent via semantic DOM attributes:
- `data-anim="fade-up"`: Triggers a 600ms cubic-bezier translation (`translateY: [24, 0]`, `opacity: [0, 1]`) on scroll entry.
- `data-anim="stagger-label"`: Used on grid items and meta lists for cascading typographic reveals (stagger interval: 45ms).
- `data-anim="line-draw"`: Animates 1px hairline dividers via `scaleX: [0, 1]` with transform-origin set to left.
- `data-anim="cinematic-zoom"`: Smooth scale shift (`scale: [1, 1.03]`) on card hover states over 700ms.