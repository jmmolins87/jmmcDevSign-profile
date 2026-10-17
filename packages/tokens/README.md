# @jmmcdev/tokens

Design tokens for the JMMC portfolio, extracted from
`resources/brutalist_editorial_architecture/DESIGN.md` and audited against
`resources/00-JMMC-project-guidelines.md` §8.

## Theme convention

Three modes: **Oscuro (default)**, **Claro** and **Sistema**.

They are applied with the `data-theme` attribute on `<html>`:

```html
<html data-theme="dark">   <!-- Oscuro (default) -->
<html data-theme="light">  <!-- Claro -->
<html data-theme="system"> <!-- Sistema: follows prefers-color-scheme -->
```

Rules (guidelines §8):

- An inline script must set the attribute **before first paint** to avoid
  flashes; the choice is persisted in `localStorage`. (Wiring belongs to
  SPEC 01 — the attribute itself is all this package provides.)
- `Sistema` resolves through `@media (prefers-color-scheme: ...)`.

## Usage

```css
body {
  background: var(--color-bg);
  color: var(--color-text);
}

/* Light mode accent used as text swaps to the high-contrast variant */
.label {
  color: var(--color-accent-text); /* #FF5A1F dark / #B8350A light */
}
```

Import the file from `apps/web/app/globals.css`:

```css
@import "@jmmcdev/tokens/tokens.css";
```

## What the variables cover

| Scope | Variables |
| --- | --- |
| Semantic colors (§8) | `--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-line`, `--color-accent`, `--color-accent-text` |
| Interactive states | `--color-on-accent`, `--color-invert-bg`, `--color-invert-text` |
| Extended surfaces (DESIGN.md) | `--color-surface-*`, `--color-on-surface*`, `--color-outline*` |
| Fonts | `--font-display` (Oswald), `--font-text` (Hanken Grotesk), `--font-mono` (JetBrains Mono) |
| Type scale | `--text-*` (sizes, line heights, letter spacing) |
| Spacing | `--space-*` |
| Shape | `--radius` (always `0px`), `--border-hairline` |

## Audit notes

- `accent: #FF5A1F` was **missing** from the DESIGN.md YAML color list (it only
  appears in that file's prose and in §8). It is defined explicitly here in both
  modes, plus its light-mode text variant `#B8350A`.
- Shadows are forbidden by the design system; there is intentionally **no
  elevation token**. Depth is expressed with hairlines and color inversion only.
