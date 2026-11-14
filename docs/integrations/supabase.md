# Integración futura con Supabase

El proyecto está preparado para sustituir los repositorios mock por adaptadores Supabase sin activar todavía ninguna conexión remota.

## Variables

Copia el template local y completa solo las variables del entorno de desarrollo:

```bash
cp .env.example .env.local
```

Variables disponibles:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://www.jmmcdevsign.es
ADMIN_NOTIFICATION_EMAIL=admin@jmmcdevsign.es
```

La URL y la clave anon/publishable son valores públicos para el cliente. Nunca se debe colocar `service_role`, una clave secreta o un token de administración en una variable `NEXT_PUBLIC_*`.

## Cliente preparado

`app/lib/supabase/client.ts` expone `getSupabaseClient()` y devuelve `null` si faltan la URL o la clave. El cliente se crea de forma perezosa con `persistSession: false`, `autoRefreshToken: false` y `detectSessionInUrl: false`.

La aplicación funciona sin `.env.local` porque todas las pantallas actuales usan repositorios mock. La simple creación del cliente no ejecuta consultas; cualquier llamada futura debe vivir en un adaptador de repositorio explícito.

## Contratos de autenticación y correo

`app/es/auth/contracts.ts` define las fronteras `AuthAdapter` y `EmailService`.
La implementación local sigue usando los repositorios mock y la bandeja de
correo mock de `app/es/auth/`; no se activa ningún adaptador remoto por defecto.

El flujo local se compone de estos límites:

- `mock-registration-service.ts` crea solicitudes `pending` y notifica al admin.
- `mock-approval-service.ts` asigna `editor`/`revisor`, crea el challenge y envía el código.
- `mock-admin-approval-actions.ts` valida el formato, token mock y expiración de los enlaces.
- `mock-auth-repository.ts` conserva los eventos mock de decisión para inspección local.
- `mock-verification-service.ts` valida digest, expiración, consumo único y cinco intentos.
- `mock-session.ts` crea la sesión mock del usuario activado.
- `mock-email-inbox.ts` conserva notificaciones y avisos de entrega de código en la bandeja de pruebas; el valor operativo no se persiste.

Los repositorios de usuarios, solicitudes, challenges y correo persisten solo en
`localStorage` del navegador para que el flujo sobreviva a la navegación entre
`/es/login` y `/es/admin/approval`. Esta persistencia no es un mecanismo de
autorización ni sustituye Supabase/RLS.

`getSupabaseClient()` solo puede crear el cliente perezoso cuando existen
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Sin ambas variables
Supabase permanece desactivado y no se ejecutan llamadas remotas. Incluso con
ellas presentes, esta fase no conecta Auth, Google, GitHub ni sesiones remotas a
la UI.

`ADMIN_NOTIFICATION_EMAIL` documenta el destinatario futuro de las
notificaciones de administración. No configura un proveedor de correo ni envía
emails reales; el flujo local debe inspeccionarse en la bandeja mock.

La matriz local es: `admin` accede a todas las superficies y gestiona
aprobaciones; `editor` y `revisor` comparten las superficies no administrativas;
una sesión anónima recibe `Sesión requerida`.

## Frontera de producción del correo de aprobación

El correo de aprobación de esta spec es una simulación local. `EmailService` y
`RenderedEmail` son las fronteras que deben conservarse cuando se sustituya el
mock por un provider adapter. La UI no debe conocer el proveedor ni firmar
acciones.

Una implementación server-side deberá cumplir, como mínimo, estas reglas:

1. **Firmar las acciones en servidor.** Generar tokens opacos o firmados con
   una clave secreta fuera del repositorio. El token debe vincular `requestId`,
   acción, destinatario admin, `iat`, `exp` y un identificador de uso único.
   Nunca aceptar como autorización los parámetros enviados por el navegador ni
   reutilizar `mock-token-*`.
2. **Autorizar antes de mutar.** Resolver la identidad admin en el servidor,
   comprobar el rol y leer el estado actual de la solicitud dentro de la misma
   operación. Aprobar o rechazar debe ser idempotente y no crear otro challenge
   si la solicitud ya fue decidida.
3. **Aplicar expiración con reloj server-side.** Validar `exp` con la hora del
   servidor y rechazar tokens caducados antes de cambiar la solicitud. La
   expiración del enlace admin es independiente de los diez minutos del código
   de verificación emitido después de aprobar.
4. **Obtener metadatos de forma confiable.** Ciudad aproximada, IP y dispositivo
   deben derivarse server-side de fuentes confiables, minimizarse y sanearse.
   Nunca deben tratarse como evidencia fiable si vienen del cliente ni
   persistirse más tiempo del necesario para auditoría y seguridad.
5. **Separar correo y decisión.** El provider adapter recibirá el
   `RenderedEmail` y será responsable de entrega, reintentos y observabilidad.
   La decisión debe ejecutarse en el servicio de dominio antes o junto al
   envío del código; un fallo de entrega no debe volver a aprobar una solicitud
   ya aprobada.
6. **No exponer secretos ni códigos operativos.** El correo pendiente solo
   muestra `PENDIENTE DE EMISIÓN`. Tras aprobar, el código se genera server-side,
   se almacena como digest, se envía una vez y se invalida por expiración,
   consumo o límite de intentos.
7. **Auditar el resultado real.** Registrar `registrationRequestId`, decisión,
   actor, timestamp, fuente y resultado (`applied`, `already-decided`,
   `invalid-token` o `expired-token`) sin guardar tokens completos ni códigos.

La sustitución futura debe introducir el adaptador, la clave gestionada y los
endpoints/server actions protegidos en una spec independiente. Esta fase no
configura proveedores, firma tokens productivos, persistencia remota ni
autorización server-side.

Las tipologías están preparadas en `app/lib/supabase/database.types.ts`. Cuando exista un esquema real, se sustituirá por tipos generados y se mantendrá el contrato `DemoRepository` como frontera de la UI.

## Límites de esta spec

- No se configura Supabase Auth real.
- No se crean tablas, migraciones, políticas RLS ni datos remotos.
- No se ejecutan consultas, suscripciones realtime ni escrituras.
- Los repositorios mock solo persisten datos locales de demostración; no se conectan a Supabase.
- No se configura ningún proveedor de correo transaccional ni se envían emails reales.

La URL canónica del portfolio es `https://www.jmmcdevsign.es/es/`.

## CLI y Supabase MCP

La CLI verificada en el entorno de desarrollo es Supabase CLI `2.122.0`.
Para evitar que la CLI escriba telemetría fuera del workspace durante una
comprobación local:

```bash
SUPABASE_TELEMETRY_DISABLED=1 supabase --version
```

El servidor MCP de Supabase se inspecciona desde Codex, sin añadir credenciales
al repositorio:

```bash
codex mcp list
codex mcp get supabase
```

Comandos de referencia para una futura spec de persistencia:

```bash
supabase init
supabase start
supabase status
supabase link --project-ref <project-ref>
supabase db diff
supabase gen types --local --lang=typescript
supabase gen types --linked --lang=typescript
supabase stop
```

`supabase db push` no forma parte de esta spec: requiere autorización explícita
porque aplica migraciones a un proyecto remoto. Tampoco se ejecutaron llamadas
mediante el MCP, consultas SQL, migraciones ni generación desde un proyecto
enlazado.

## Vercel

Cuando exista un proyecto Vercel autorizado, el flujo documentado es:

```bash
vercel login
vercel link
vercel project inspect --non-interactive
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel build --prod
vercel deploy --prebuilt --prod
```

La inspección del proyecto debe confirmar propietario y proyecto antes de
configurar variables o desplegar. Los valores sensibles se introducen mediante
el gestor de variables de Vercel o `VERCEL_TOKEN` en CI; nunca se versionan.
