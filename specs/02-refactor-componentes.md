# SPEC 02 — Refactor a componentes compartidos sin cambio visual

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-09-25
> **Objective:** Extraer los patrones repetidos de la landing a componentes compartidos sin cambiar ni un píxel.

## Por qué existe esta spec

La SPEC 01 priorizó la fidelidad 1:1 con el HTML de referencia y cada sección repite el mismo wrapper, la misma cabecera `NN — NOMBRE` con hairline y el mismo divisor posterior. Los pills de tags y badges se repiten además en cinco secciones. Hace falta consolidar esos patrones en primitivas reutilizables para que el código quede mínimo antes de seguir añadiendo pantallas.

## Alcance

**In:**

- Cuatro primitivas nuevas en `app/components/ui/`: `Section`, `SectionHeading`, `HairlineDivider` y `Chip`.
- Migración de las 8 secciones (`Hero`, `About`, `Stack`, `Experience`, `Projects`, `Services`, `Blog`, `Contact`) a esas primitivas.
- Capturas Playwright baseline y after organizadas por carpetas por spec: `.playwright-mcp/02-refactor-componentes/baseline/` y `/after/`.
- Verificación con `npm run build`, `npm run lint` y `npx tsc --noEmit`.

**Fuera de alcance (specs futuras):**

- Cambios visuales de cualquier tipo (colores, espaciados, tipografías, conducta de animaciones).
- Nuevas primitivas fuera de las cuatro listadas (botones, inputs, tarjetas).
- Tocar el modelo de `lib/content.ts` o el animador `ScrollAnimations.tsx`.
- Pantallas 01b y 02–06.

## Modelo de datos

Esta spec no introduce estructuras de datos nuevas. Reutiliza el modelo de SPEC 01. Solo aparecen props de presentación:

```ts
// app/components/ui/Section.tsx
type SectionProps = { id?: string; anim?: string; children: React.ReactNode };

// app/components/ui/SectionHeading.tsx
type SectionHeadingProps = { index: string; name: string };

// app/components/ui/Chip.tsx
type ChipProps = { tone?: "default" | "live"; children: React.ReactNode };
```

Convención: `Section` renderiza el `<section>` con el contenedor 1280px y el `HairlineDivider` posterior. El hero la usa sin `SectionHeading`.

## Plan de implementación

1. **Baseline.** Capturar las 8 secciones a 1440px y hero, stack y contacto a 390px en `.playwright-mcp/02-refactor-componentes/baseline/`. *Verificar:* los ficheros existen.
2. **Primitivas.** Crear `app/components/ui/Section.tsx`, `SectionHeading.tsx`, `HairlineDivider.tsx` y `Chip.tsx` (con tonos `default` y `live` para el badge teal de demos). *Verificar:* `npx tsc --noEmit` pasa.
3. **Migración 1.** Migrar `Hero`, `About` y `Stack` a las primitivas. *Verificar:* `npm run build` termina sin errores.
4. **Migración 2.** Migrar `Experience`, `Projects`, `Services`, `Blog` y `Contact` a las primitivas. *Verificar:* ningún `grep` encuentra el wrapper `max-w-[1280px] mx-auto px-margin-mobile` fuera de `ui/`.
5. **QA visual.** Capturar lo mismo que en el paso 1 en `.../after/`, comparar visualmente baseline contra after y ejecutar `npm run lint` y `npx tsc --noEmit`. *Verificar:* cero diferencias visuales y cero errores.

## Criterios de aceptación

- [ ] Existen los 4 ficheros en `app/components/ui/` y ningún otro componente nuevo.
- [ ] Las 8 secciones importan de `app/components/ui/` y el wrapper de 1280px solo existe en `ui/`.
- [ ] `npm run build`, `npm run lint` y `npx tsc --noEmit` terminan sin errores.
- [ ] `git diff` en `lib/content.ts` y `ScrollAnimations.tsx` está vacío.
- [ ] Las capturas `after/` no muestran diferencias de jerarquía, espaciado ni tipografía respecto a `baseline/`.
- [ ] Las capturas viven en `.playwright-mcp/02-refactor-componentes/{baseline,after}/`.

## Decisiones

- **Sí:** extraer nivel sección (`Section`, `SectionHeading`, `HairlineDivider`) y nivel átomo (`Chip`). **No:** solo nivel sección, porque los pills son la duplicación más numerosa.
- **Sí:** subdirectorio `app/components/ui/` para primitivas. **No:** todo plano en `app/components/`, que mezcla secciones con primitivas.
- **Sí:** `Chip` con tonos `default` y `live`. **No:** un componente por cada variante de badge.
- **Sí:** verificación con capturas Playwright before/after. **No:** solo `build`/`lint`/`tsc`, que no detectan drift visual.
- **Sí:** capturas organizadas por carpetas por spec. **No:** seguir acumulando todo en la raíz de `.playwright-mcp/`.
- **Sí:** depende de SPEC 01 e se implementa en rama propia (`spec-02-refactor-componentes`). **No:** trabajar sobre la rama `spec-01-landing-editorial`.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Al fusionar classNames cambia la especificidad y algo se ve distinto | La comparación baseline/after lo detecta; revertir el paso de migración afectado |
| `Chip` no cubre alguna variante de pill y se fuerza su uso | Solo las variantes `default` y `live` migran; el resto queda como está, fuera de la spec |

## Lo que **no** está en esta spec

- Cambios visuales, nuevas primitivas y pantallas 01b y 02–06.
- Cambios en `lib/content.ts`, animaciones o lógica de negocio.
- Ningún fichero nuevo fuera de `app/components/ui/` y las capturas de `.playwright-mcp/02-refactor-componentes/`.
