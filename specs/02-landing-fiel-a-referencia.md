# SPEC 02 — Landing fiel a `resources/01_landing` con motion avanzado

> **Status:** Implemented
> **Depends on:** SPEC 01
> **Date:** 2026-11-13
> **Objective:** Actualizar `/es/` para reproducir estrictamente `resources/01_landing` con datos mock, assets locales y una capa de motion avanzada basada en GSAP, Motion y Lenis.

## Scope

**In:**

- Sustituir la composición actual de `/es/` por la estructura visual de `resources/01_landing/code.html` y `screen.png`.
- Mantener las siete secciones de la referencia:
  - hero;
  - presentación;
  - demos interactivas;
  - capacidades técnicas;
  - trayectoria;
  - publicaciones técnicas;
  - contacto y footer.
- Reproducir la dirección visual de la referencia en escritorio y móvil.
- Mantener los tokens de color, tipografía, espaciado, grid, hairlines, ausencia de radios y uso restringido del naranja definidos por el sistema existente.
- Crear un shell exclusivo para la landing con header editorial, menú, selector de tema, selector visual de idioma y acceso a `/es/login`.
- Mantener el shell actual de las rutas de login y demos sin cambios visuales obligatorios.
- Usar el copy de `resources/01_landing/code.html`, salvo el correo canónico definido en SPEC 01.
- Mantener `hola@jmmcdevsign.es` como correo visible de contacto.
- Crear assets locales mock para el retrato y la imagen editorial de publicaciones.
- Mantener todos los datos funcionales como fixtures y estados mock locales.
- Añadir GSAP para las secuencias, el hero, el warp y el parallax.
- Añadir `@gsap/react` para integrar GSAP con React y limpiar sus efectos al desmontar.
- Añadir Motion para menú, CTA, feedback y microinteracciones de interfaz.
- Añadir Lenis para implementar smooth-scroll hijacking en la landing.
- Sincronizar Lenis con ScrollTrigger mediante la integración compatible con las versiones instaladas.
- Implementar un timeline inicial del hero con entrada escalonada de metadatos, brackets, monograma, estrella y CTA.
- Implementar un warp dinámico con capas independientes de líneas radiales, nodos, brillo, brackets, monograma y estrella.
- Implementar parallax ligado al puntero y al scroll en escritorio.
- Implementar parallax ligado únicamente al scroll en móvil.
- Implementar cursor editorial únicamente en dispositivos con puntero preciso.
- Implementar reloj UTC mock actualizado localmente una vez por segundo.
- Implementar indicador operativo y estados animados del hero.
- Añadir un control visible y accesible `PAUSE / PLAY` para el warp continuo.
- Permitir que GSAP y Motion actúen sobre el mismo elemento cuando sea necesario, con propiedad exclusiva por motor.
- Ejecutar la verificación visual en viewports de 375px y 1440px.
- Mantener la navegación, el formulario y las llamadas a acción sin backend real.

**Out of scope (for future specs):**

- Datos reales, persistencia remota o integración con Supabase.
- Envío real del formulario de contacto.
- Internacionalización real o una ruta inglesa.
- Autenticación real.
- Datos reales para demos, publicaciones, capacidades o trayectoria.
- Sensores de orientación del dispositivo.
- Touch tracking del dedo.
- Parallax basado en sensores o gestos táctiles.
- Smooth scroll cuando el usuario tiene activado `prefers-reduced-motion: reduce`.
- Parallax de puntero en dispositivos táctiles o sin hover preciso.
- Dos motores escribiendo simultáneamente la misma propiedad CSS del mismo elemento.
- Animar propiedades de layout cuando el efecto pueda resolverse con `transform` u `opacity`.
- Añadir una segunda librería de scroll o una implementación propia paralela a Lenis.
- Cambiar visualmente las rutas de login y demos fuera de los contratos compartidos estrictamente necesarios.
- Analytics, observabilidad de producción o medición real de rendimiento.

## Data model

La landing usa datos locales tipados. No se crea un esquema remoto ni se añade persistencia.

### Contenido editorial mock

```ts
type LandingSectionId =
  | "presentacion"
  | "demos"
  | "skills"
  | "trayectoria"
  | "blog"
  | "contacto";

type LandingSection = {
  id: LandingSectionId;
  index: string;
  eyebrow: string;
  title: string;
};

type LandingPost = {
  id: string;
  title: string;
  category: string;
  readingTime: string;
  href: string;
};
```

Los grupos de capacidades, entradas de trayectoria, demos y publicaciones se mantienen como constantes locales tipadas en la superficie de landing.

### Estado del formulario mock

```ts
type ContactFormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };
```

El formulario no realiza solicitudes de red. La confirmación se muestra localmente y el estado de error queda preparado para probar la interfaz.

### Estado del motion

```ts
type WarpPlaybackState = "playing" | "paused";

type MotionPreference = "full" | "reduced";

type HeroMotionState = {
  warp: WarpPlaybackState;
  preference: MotionPreference;
  smoothScrollEnabled: boolean;
  pointerParallaxEnabled: boolean;
  scrollParallaxEnabled: boolean;
};
```

Las preferencias se derivan de `prefers-reduced-motion`, del viewport y de la capacidad de puntero. No se persisten entre sesiones.

### Propiedad de animación

Cuando GSAP y Motion actúen sobre el mismo elemento, cada motor tendrá un contrato explícito:

- GSAP controla `transform`, `x`, `y`, `rotation`, `scale` y valores ligados a scroll.
- Motion controla `opacity`, `color`, `backgroundColor` y estados de interacción.
- Ningún motor escribe la misma propiedad durante la misma interacción.

## Implementation plan

1. Añadir `gsap`, `@gsap/react`, `motion` y `lenis` en `package.json` y actualizar el lockfile con el gestor fijado por el proyecto.
2. Crear los assets mock locales para el retrato, la imagen editorial y el logo usado por la landing.
3. Crear el shell específico de landing con header, navegación editorial, menú, tema, idioma visual y acceso.
4. Sustituir la estructura actual de `LandingPage` por las siete secciones de la referencia manteniendo los componentes base reutilizables.
5. Implementar el hero estático con la grid, metadatos, brackets, monograma, estrella y capas SVG necesarias para el warp.
6. Integrar Lenis únicamente en cliente y sincronizarlo con ScrollTrigger con cleanup completo al desmontar.
7. Implementar con `useGSAP()` la secuencia inicial del hero y las animaciones de entrada usando refs y scope local.
8. Implementar el warp continuo y el control `PAUSE / PLAY` con estado accesible, pausa real y reanudación determinista.
9. Implementar parallax de puntero y scroll en escritorio, y parallax de scroll en móvil, usando transforms y límites de intensidad por viewport.
10. Implementar el cursor editorial con `gsap.quickTo()` y ocultarlo en dispositivos táctiles o sin hover preciso.
11. Implementar con Motion el menú, CTA, feedback del formulario, estados hover/press y transiciones de opacidad/color.
12. Implementar la detección de `prefers-reduced-motion` para desactivar Lenis, parallax, warp continuo, cursor y desplazamientos de profundidad, manteniendo fades y estados esenciales.
13. Añadir tests de componentes para menú, control de warp, formulario, estados de motion y navegación por anclas.
14. Añadir tests E2E para la landing a 375px y 1440px, smooth scroll, pausa/play, teclado, reduced motion, consola limpia y ausencia de overflow horizontal.
15. Ejecutar las verificaciones completas, revisar capturas normales y reducidas, detener el servidor y eliminar todos los archivos temporales antes de cerrar la fase.

## Acceptance criteria

- [x] `/es/` reproduce la estructura, jerarquía, copy, grid, tipografía, color y densidad de `resources/01_landing/screen.png`.
- [x] La landing carga sin errores de runtime ni errores de consola.
- [x] Las siete secciones aparecen en el mismo orden que la referencia.
- [x] La landing funciona a 1440px.
- [x] La landing funciona a 375px.
- [x] No existe overflow horizontal a 375px.
- [x] El shell específico de landing no altera visualmente login ni demos.
- [x] El hero contiene los metadatos, brackets, monograma, estrella y capas de warp de la referencia.
- [x] GSAP controla la secuencia, el warp, el parallax y las animaciones ligadas al scroll del hero.
- [x] Motion controla el menú, las microinteracciones, el feedback y los estados visuales de interfaz.
- [x] Lenis implementa smooth-scroll hijacking en la landing cuando la preferencia de movimiento lo permite.
- [x] Lenis se sincroniza correctamente con ScrollTrigger.
- [x] Lenis se desactiva cuando `prefers-reduced-motion: reduce` está activo.
- [x] El parallax de puntero funciona en escritorio con puntero preciso.
- [x] El parallax de puntero no se activa en dispositivos táctiles.
- [x] El parallax de scroll funciona en escritorio y móvil cuando la preferencia de movimiento lo permite.
- [x] No se usan sensores de orientación.
- [x] No se usa touch tracking del dedo.
- [x] El warp continuo puede pausarse y reanudarse desde un control visible.
- [x] El control de warp expone `aria-pressed` y se puede usar con teclado.
- [x] El cursor editorial usa una actualización eficiente y se oculta en touch.
- [x] El reloj UTC mock se actualiza una vez por segundo y limpia su intervalo.
- [x] GSAP y Motion no escriben simultáneamente la misma propiedad del mismo elemento.
- [x] Las animaciones priorizan `transform` y `opacity` frente a propiedades de layout.
- [x] Los contextos, timelines, listeners, Lenis y ScrollTriggers se limpian al desmontar.
- [x] `prefers-reduced-motion` elimina el movimiento de profundidad, parallax, smooth scroll y warp continuo.
- [x] `prefers-reduced-motion` conserva fades breves, color, foco y feedback esencial.
- [x] Los assets de retrato e imagen editorial se cargan desde rutas locales.
- [x] La landing muestra `hola@jmmcdevsign.es` como correo de contacto.
- [x] El formulario muestra una confirmación mock sin realizar solicitudes de red.
- [x] La navegación por teclado mantiene foco visible y nombres accesibles.
- [x] `pnpm lint` pasa.
- [x] `pnpm typecheck` pasa.
- [x] `pnpm test` pasa.
- [x] `pnpm test:e2e` pasa.
- [x] `pnpm build` pasa.
- [x] Los temporales, capturas de trabajo y carpetas de Playwright se eliminan tras la revisión.

## Decisions

- **Sí:** sustituir la landing actual por una implementación fiel a `resources/01_landing`. La referencia es la fuente visual de esta fase.
- **Sí:** mantener las siete secciones del HTML original. Permite conservar la narrativa editorial completa.
- **Sí:** mantener `hola@jmmcdevsign.es`. SPEC 01 define este contacto como contrato canónico del proyecto.
- **Sí:** usar assets locales mock. Evita depender de URLs remotas y permite verificar la landing sin red.
- **Sí:** crear un shell exclusivo de landing. El header de la referencia no debe romper las demás superficies.
- **Sí:** usar GSAP para hero, warp, parallax, cursor y ScrollTrigger. Es la librería adecuada para secuencias y motion ligado al scroll.
- **Sí:** usar Motion para menú, feedback y microinteracciones. Separa las transiciones de interfaz de la composición cinematográfica.
- **Sí:** usar Lenis para smooth-scroll hijacking. Evita una implementación propia y permite sincronización explícita con ScrollTrigger.
- **Sí:** permitir parallax de puntero y scroll en escritorio. Es parte de la experiencia visual solicitada.
- **Sí:** permitir parallax ligado al scroll en móvil. No se depende de hover, sensores ni gestos táctiles.
- **Sí:** incluir un control visible de pausa/play. El warp continuo debe poder detenerse manualmente.
- **Sí:** desactivar smooth scroll, parallax y warp continuo con `prefers-reduced-motion`. Reduce riesgo vestibular y mantiene una variante estática utilizable.
- **Sí:** separar propiedades entre GSAP y Motion cuando compartan nodo. Evita conflictos de escritura y estados no deterministas.
- **No:** integrar Supabase, backend o persistencia real. Esta fase sigue siendo mock.
- **Sí:** usar sensores de orientación. Requieren permisos y generan comportamiento inconsistente entre dispositivos.
- **Sí:** usar touch tracking del dedo. Interferiría con el scroll y no es necesario para la dirección visual.
- **Sí:** añadir una segunda solución de smooth scroll. Lenis será la única autoridad del desplazamiento suavizado.
- **Sí:** cambiar visualmente login y demos fuera de los contratos compartidos necesarios.

## Risks

| Risk | Mitigation |
| --- | --- |
| Lenis y ScrollTrigger pueden desincronizarse o dejar listeners activos | Integrar el scroller con la API compatible de las versiones instaladas, usar cleanup completo y probar navegación/desmontaje. |
| GSAP y Motion pueden competir por estilos del mismo nodo | Documentar propiedad por motor y cubrir los estados compartidos con tests de interacción. |
| El parallax y el warp pueden generar jank en móvil | Usar transforms, limitar capas activas, desactivar puntero en touch y probar a 375px. |
| Smooth scroll y parallax pueden provocar molestias vestibulares | Desactivar ambos con `prefers-reduced-motion` y conservar solo transiciones suaves de opacidad/color. |
| Assets locales pueden diferir de la referencia original | Crear assets mock con el mismo encuadre, contraste, escala y tratamiento monocromo. |
| El uso de Motion y GSAP aumenta el bundle | Importar únicamente los módulos necesarios, evitar animaciones duplicadas y revisar el build final. |
| El control de pausa puede quedar oculto en la composición | Mantenerlo visible, con foco accesible y etiqueta técnica coherente con la referencia. |

## What is **not** in this spec

- Supabase, persistencia o datos reales.
- Envío real del formulario.
- Internacionalización inglesa real.
- Sensores de orientación.
- Touch tracking del dedo.
- Smooth scroll con reduced motion activo.
- Dos motores escribiendo simultáneamente la misma propiedad.
- Cambios visuales generales en las demás rutas.
- Analytics, observabilidad o monitorización de producción.

Cada punto podrá definirse en una spec independiente si se incorpora posteriormente.
