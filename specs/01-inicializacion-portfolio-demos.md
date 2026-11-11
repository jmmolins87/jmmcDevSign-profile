# SPEC 01 — Inicialización del portfolio JMMC y demos mock

> **Status:** Approved
> **Depends on:** Ninguna
> **Date:** 2026-11-11
> **Objective:** Preparar el proyecto Next.js para el sitio `/es/` y sus nueve superficies de diseño como rutas navegables, reutilizables, testeables y listas para una futura integración con Supabase y Vercel.

## Scope

**In:**

- Analizar y convertir las nueve superficies de `resources` en rutas reales:
  - landing;
  - autenticación;
  - aprobación de accesos;
  - editor de posts;
  - agent builder;
  - workflow de leads;
  - cualificación de leads;
  - pedidos realtime;
  - backoffice empresarial.
- Mantener la dirección visual de `resources/00_brutalist_editorial_architecture/DESIGN.md`.
- Crear tokens centralizados para color, tipografía, espaciado, layout, bordes y estados.
- Crear componentes reutilizables para navegación, formularios, modales, tablas, listas editoriales, filtros, paneles, status indicators y estados de interfaz.
- Implementar rutas e interacciones con datos mock locales.
- Preparar autenticación mock con sesión local y roles `admin`, `editor` y `lector`.
- Preparar una capa de repositorios mock sustituible posteriormente por Supabase.
- Preparar el cliente y las variables necesarias para Supabase sin depender de conexión remota.
- Preparar el proyecto para despliegue en Vercel.
- Añadir tests unitarios, tests de componentes y tests E2E.
- Usar español como idioma inicial, con `/es/` como ruta canónica.
- Usar dark mode como tema inicial y permitir alternar a light mode.
- Usar `hola@jmmcdevsign.es` como correo de contacto.
- Documentar la URL canónica `https://www.jmmcdevsign.es/es/`.

**Out of scope (for future specs):**

- Autenticación real con Supabase Auth, OAuth o magic links.
- Tablas, migraciones, políticas RLS y datos persistidos en Supabase.
- Email real de aprobación o envío de notificaciones.
- Realtime real mediante Supabase.
- CMS, blog persistente o editor conectado a backend.
- Integraciones externas con GitHub, LinkedIn, X u otros servicios.
- Panel de administración conectado a datos reales.
- Internacionalización distinta de la ruta española inicial.
- Analytics, observabilidad de producción y monitorización avanzada.
- Funcionalidades de negocio no representadas por las nueve superficies de `resources`.

## Data model

La primera versión usa datos locales tipados. No se crea todavía un esquema remoto de Supabase.

### Sesión mock

```ts
type UserRole = "admin" | "editor" | "lector";

type MockSession = {
  userId: string;
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
};
```

La sesión se persiste localmente para permitir probar login, logout y rutas protegidas sin Supabase Auth.

### Contrato de repositorios

```ts
interface DemoRepository<T, TInput = unknown> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(input: TInput): Promise<T>;
  update(id: string, input: TInput): Promise<T>;
}
```

Los componentes consumen repositorios y no acceden directamente a `localStorage`, fixtures ni Supabase.

### Entidades mock

Se crearán tipos y fixtures para:

- solicitudes de acceso y aprobaciones;
- posts y bloques de contenido;
- agentes y configuraciones;
- workflows, nodos y eventos;
- leads y estados de cualificación;
- pedidos, estados y eventos realtime;
- métricas y registros de backoffice.

Cada entidad tendrá identificador estable y datos suficientes para representar estados normal, loading, vacío y error.

### Configuración de entorno

Se documentarán estas variables sin incluir valores secretos:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://www.jmmcdevsign.es
```

La aplicación deberá poder ejecutarse sin estas variables cuando esté usando exclusivamente los repositorios mock.

## Implementation plan

1. Crear la estructura `specs/`, registrar esta spec como `Draft` y documentar que la implementación solo comienza cuando pase a `Approved`.
2. Sustituir el starter de Next.js por el mapa de rutas `/es` y `/es/demos`, manteniendo cada ruta ejecutable aunque sus datos sean mock.
3. Crear los tokens globales derivados de `DESIGN.md`, incluyendo colores dark/light, tipografías, espaciado, gutters, breakpoints, hairlines, radios y estados.
4. Configurar las fuentes Oswald, Hanken Grotesk y JetBrains Mono con fallback seguro para desarrollo, tests y build.
5. Implementar el shell compartido: header, navegación desktop, menú móvil, selector de tema, selector de idioma, footer y enlaces de contacto.
6. Implementar los componentes base accesibles: botones, inputs, selects, checkboxes, modal, drawer, tabs, filtros, badges cuadrangulares, tablas, cards, listas, status indicators y estados de interfaz.
7. Implementar la landing en `/es/` usando los patrones de `resources/01_landing` y los componentes compartidos.
8. Implementar `/es/login` y la sesión mock con login, logout, roles, persistencia local y estados de error.
9. Implementar `/es/admin/approval`, `/es/blog/editor` y `/es/demos/agent-builder` con sus fixtures y acciones principales.
10. Implementar `/es/demos/leads-workflow`, `/es/demos/lead-qualification`, `/es/demos/orders-realtime` y `/es/demos/business-backoffice` con escenarios específicos, filtros y transiciones mock.
11. Crear la capa de repositorios mock y asegurar que las pantallas no dependan directamente de fixtures ni de `localStorage`.
12. Preparar el cliente Supabase, `.env.example` y documentación de integración futura sin realizar llamadas remotas, migraciones ni escritura de datos.
13. Configurar Vitest, Testing Library y Playwright, incluyendo scripts reproducibles para `typecheck`, `lint`, `test`, `test:e2e` y `build`.
14. Documentar ejecución local, mapa de rutas, variables, comandos de Supabase MCP y despliegue en Vercel.
15. Ejecutar las verificaciones completas y corregir cualquier fallo de tipos, lint, tests, build, accesibilidad o navegación antes de marcar la spec como implementada.

## Acceptance criteria

- [x] La ruta `/es/` carga sin errores de runtime ni errores de consola.
- [x] Las nueve superficies de `resources` están representadas en rutas navegables.
- [x] Las rutas implementadas son `/es/`, `/es/login`, `/es/admin/approval`, `/es/blog/editor`, `/es/demos/agent-builder`, `/es/demos/leads-workflow`, `/es/demos/lead-qualification`, `/es/demos/orders-realtime` y `/es/demos/business-backoffice`.
- [x] El contenido inicial de la interfaz está en español.
- [x] Dark mode es el tema inicial.
- [x] El usuario puede alternar entre dark y light mode.
- [x] La preferencia de tema se conserva tras recargar la página.
- [x] Los colores, tipografías, márgenes, padding, gutters, hairlines y estados se consumen desde tokens centralizados.
- [x] Los componentes principales no usan `border-radius` distinto de `0px`.
- [x] Los componentes principales no usan sombras difusas ni `box-shadow`.
- [x] El color naranja de acento se reserva para estados activos, indicadores operativos y marcadores definidos por `DESIGN.md`.
- [x] El login mock permite iniciar sesión con un usuario fixture.
- [x] El logout elimina la sesión mock.
- [x] Los roles `admin`, `editor` y `lector` se pueden representar en la UI.
- [x] Las rutas o acciones restringidas muestran un estado no autorizado verificable.
- [x] Cada demo tiene datos mock propios y acciones principales funcionales.
- [x] Las pantallas incluyen estados loading, vacío y error verificables.
- [x] La landing muestra `hola@jmmcdevsign.es` como contacto.
- [x] La documentación muestra `https://www.jmmcdevsign.es/es/` como URL canónica.
- [x] La aplicación funciona sin conexión a Supabase cuando usa datos mock.
- [x] No hay secretos, tokens ni credenciales en el repositorio.
- [x] Existe `.env.example` con las variables necesarias para la integración futura.
- [x] Existen tests unitarios para tokens, sesión mock y repositorios.
- [x] Existen tests de componentes para navegación, modal, formularios y estados de interfaz.
- [x] Existen tests E2E para navegación principal, login/logout, cambio de tema y al menos un flujo completo de cada familia de demo.
- [x] Los tests E2E comprueban viewport móvil de 375px y escritorio de 1440px.
- [x] La navegación principal se puede completar con teclado.
- [x] Los elementos interactivos tienen nombre accesible y foco visible.
- [x] `pnpm lint` pasa.
- [x] `pnpm typecheck` pasa.
- [x] `pnpm test` pasa.
- [x] `pnpm test:e2e` pasa.
- [x] `pnpm build` pasa.
- [x] El proyecto queda listo para un despliegue posterior en Vercel.


### Evidencia de verificación (2026-11-11)

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (7 archivos, 15 tests), `pnpm build` y `pnpm test:e2e` (8 tests: 1440 y 375 px): correctos. Los E2E cubren navegación, login/logout, tema, consola y siete flujos de demos.
- Build: `/es` y las ocho rutas restantes aparecen como páginas estáticas. Capturas revisadas en Chromium para la landing oscura a 1440 y 375 px; temporales borrados tras la revisión.
- Código: `app/globals.css` centraliza tokens y foco, `app/es/auth/mock-session.ts` valida los tres perfiles, `app/es/repositories/` desacopla los datos y `app/lib/supabase/` admite variables vacías. `README.md` y `.env.example` documentan URL, entorno y Vercel; búsqueda de archivos versionados sin claves privadas ni `.env` con valores.
- Correcciones finales: el contenido visible de las rutas se tradujo al español; `Button` y las barras de puntuación dejaron de usar relleno naranja; `InterfaceStateControls` expone carga, vacío y error en las superficies protegidas y tiene cobertura de componente.
- La búsqueda de usos de acento queda limitada a marcadores, foco, navegación activa, estado operativo y el símbolo de marca definidos por `DESIGN.md`.
- Context7 devolvió «Monthly quota exceeded». Se contrastaron rutas, layout y metadata con `node_modules/next/dist/docs/` de Next.js 16.4.6. El MCP de Playwright carece de Chrome del sistema; la prueba E2E y las capturas se realizaron con Chromium incluido en Playwright.

## Decisions

- **Sí:** una primera spec de fundación más todas las páginas. La petición inicial abarca una base compartida y nueve superficies relacionadas.
- **Sí:** rutas reales bajo `/es` y `/es/demos`. Esto permite probar navegación, enlaces y E2E desde el primer incremento.
- **Sí:** escenarios mock específicos por demo. Cada pantalla tiene una intención funcional distinta y necesita estados representativos propios.
- **Sí:** Vitest + Testing Library + Playwright. Separa pruebas unitarias/componentes de los flujos completos de navegador.
- **Sí:** dark mode inicial con alternancia light mode. Es el orden visual definido por `DESIGN.md` y mantiene la variante clara disponible.
- **Sí:** tokens centralizados derivados de `DESIGN.md`. Evita valores visuales dispersos y permite corregir la dirección visual desde un único sistema.
- **Sí:** Supabase preparado sin persistencia remota. La base futura queda desacoplada sin bloquear la implementación mock.
- **Sí:** sesión local mock. Permite probar autenticación y autorización sin credenciales ni infraestructura externa.
- **Sí:** reutilizar assets y extraer patrones de `resources`. Los HTML originales son referencias visuales, no componentes runtime.
- **No:** incrustar los HTML de `resources`. Mezclar HTML generado con React dificultaría accesibilidad, reutilización y mantenimiento.
- **No:** crear tablas, migraciones o políticas RLS en esta spec. La persistencia real requiere una spec específica de modelo y seguridad.
- **No:** implementar email real, OAuth o realtime real. Son integraciones externas que deben verificarse por separado.
- **No:** añadir dependencias visuales o de componentes sin justificación. Se priorizarán primitivas propias y las dependencias necesarias para testing y Supabase.

## Risks

| Risk | Mitigation |
| --- | --- |
| Next.js 16 introduce APIs o convenciones distintas a versiones anteriores | Consultar las guías internas disponibles en `node_modules/next/dist/docs/` antes de implementar APIs específicas. |
| El alcance de nueve superficies genera duplicación | Separar shell, primitivas, patrones y páginas; mantener fixtures y repositorios por dominio. |
| La futura integración con Supabase rompe la UI | Mantener contratos de repositorio independientes del proveedor de persistencia. |
| Las fuentes externas no están disponibles en todos los entornos | Usar carga de fuentes compatible con build y fallbacks locales documentados. |
| Las interacciones mock pueden parecer funcionalidad real | Etiquetar los estados como mock/demo y documentar explícitamente las limitaciones. |
| Tests E2E dependientes de servidor o datos compartidos | Usar fixtures deterministas, aislamiento por test y configuración reproducible de Playwright. |
| Diferencias visuales entre viewport móvil y escritorio | Verificar explícitamente 375px y 1440px y mantener la composición basada en la grid definida. |

## What is **not** in this spec

- Supabase Auth real.
- Persistencia real, migraciones o RLS.
- Email real y notificaciones.
- Realtime real.
- CMS o blog conectado a backend.
- Integraciones sociales externas.
- Analytics y observabilidad de producción.
- Internacionalización completa.

Cada punto deberá definirse en una spec independiente si se incorpora posteriormente.
