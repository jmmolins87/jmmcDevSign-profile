# Coordinación de locale y reproducción — SPEC 10

## Ronda 1 — orquestador

**Propuesta:** mantener una sola composición de rutas en `app/[locale]`, una frontera de contexto de locale y un controlador de reproducción compartido. Cada adaptador conserva sus fixtures, repositorios y efectos de negocio. Delimitar archivos entre agentes para evitar escrituras simultáneas.

**Evidencia:** spec Approved, diseño decisiones 1 y 3; `openspec instructions apply --change 10-landing-demo-experience --json`; Next.js 16.4.6, guía local `01-app/02-guides/internationalization.md`; baseline de 211 tests.

**Contrato acordado para integrar:**

- `LocaleProvider`, `useLocale`, `useCopy` en `app/lib/locale-context.tsx`; utilidades de ruta puras en `app/lib/i18n.ts`.
- `useDemoPlayback({ steps, onStep, onReset })` expone estado, error y operaciones start/pause/resume/reset, apoyándose en el contrato de la spec.
- `DemoPlaybackControls({ playback })` presenta las mismas acciones accesibles en cada demo.
- Reset restaura los fixtures del adaptador después de esperar mutaciones en curso; el reloj compartido no decide datos de negocio.
- Las rutas de membresía siguen siendo `/es/login` y `/en/login`, usando la convención oficial de rutas interceptadas/paralelas.

**Alternativas consideradas:** duplicar páginas o temporizadores por demo se descartó ya en el diseño aprobado. Un provider con query `?auth=login` fue propuesto durante Apply y retirado antes de integrarse para conservar el modelo de rutas aprobado.

**Impacto:** el agente locale realiza la migración mecánica inicial y las superficies públicas; el agente workflow provee primero el contrato común para desbloquear los otros adaptadores. El agente de las otras demos corrige también el cierre/foco del Drawer compartido.

## Respuestas recibidas

- `front_locale_landing`: confirmó migración e imports completados, contexto y utilidades disponibles; confirmó adopción de rutas interceptadas/paralelas y retirada del provider de query.
- `front_workflow_playback`: confirmó implementación de runtime/hook/controles con la firma acordada, espera de mutaciones al reset y pruebas de carreras de inicio/reset/stop.
- `front_remaining_demos`: confirmó integración con el contrato común y aislamiento de fixtures, roles, persistencia y eventos de sus tres dominios.

## Decisión

Se integra el contrato compartido descrito, conforme a las decisiones ya aprobadas de la spec. No cambia el alcance ni los contratos de dominio. El orquestador verifica la integración y mantiene las tareas; un agente test ejecutará los gates y otro agente independiente verificará la spec. No hay decisiones bloqueantes abiertas.

## Ronda 2 — correcciones de integración, 2026-11-19

**Evidencia de frontend/testing:** cambiar suavemente de `/es/login` a `/en/login` podía conservar el provider español y abrir una segunda modal. La regresión de borrador seguro falló en navegador; conservar contraseñas contradecía el criterio aprobado. También se detectó una búsqueda vacía del Backoffice sin recuperación y un destino editorial cambiado accidentalmente.

**Detalle acordado dentro del alcance:** los CTA siguen usando la modal interceptada. Solo el cambio de idioma desde autenticación realiza navegación nativa con reemplazo de la entrada de historial. Antes de salir se vacían contraseñas; un registro de `sessionStorage` de un solo uso transporta exclusivamente vista, nombre, email y rol permitidos. Se valida, se elimina al consumir y no se restaura si no puede eliminarse. Almacenamiento denegado mantiene disponible la navegación con formulario vacío. Landing y demos conservan navegación del router, query y fragmento.

**Impacto y recuperación:** sin cambios en sesiones, permisos, proveedores ni contratos de dominio; sin dependencias nuevas. El rollback local y la degradación están documentados en `app/[locale]/login/README.md`. El verificador independiente revisó la whitelist, el rechazo de propiedades desconocidas y la ausencia de credenciales. La aprobación de implementación ya cubre estos comportamientos; no se añadieron requisitos ni se modificó el alcance.

**Correcciones adicionales:** el enlace editorial mantiene `/[locale]/blog/editor`; búsqueda sin coincidencias muestra estado accesible y limpieza del filtro en ambos idiomas.

**Evidencia de testing:** queries de `status`/`alert` acotadas a su diálogo/reproductor mantuvieron las aserciones y pasaron el focal antes rojo. En Firefox se aisló una caída nativa SIG11 disparada por `toHaveJSProperty` sobre el progreso de la aplicación; el caso completo pasó al comprobar el atributo nativo `value` y `max=100`, conservando teclado, valores exactos, snapshot inmóvil al pausar, reanudación, finalización y reset. El control negativo de progreso incorrecto siguió fallando. No se cambiaron navegador, vídeo, retries ni timeouts.
